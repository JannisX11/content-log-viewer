import { IssueType, IssueTypes, IssueTypeScriptError, IssueTypeScriptWarning, IssueTypeUnknown, TypeAliases } from "./issue_types"

function extractVariables(template: string, input: string): Record<string, string> | null {
	let variables: Record<string, string> = {};
    for (let ti = 0, ii = 0; ti < template.length; ti++) {
		let t_char = template[ti];
		let i_char = input[ii];
		if (t_char == '{') {
			let var_end: number = template.substring(ti).search('}');
			let variable: string = template.substring(ti+1, ti+var_end);
			ti += var_end+1;
			let end_match = template[ti] ? template[ti]+(template[ti+1]??'') : '';

			if (variable.includes('|')) {
				let pattern_match_end: number = template[ti] ? input.substring(ii).lastIndexOf(end_match) : -1;
				let value: string = input.substring(ii, pattern_match_end != -1 ? ii+pattern_match_end : undefined);
				ii += value.length;
				console.log({variable, value, pattern_match_end, char: template[ti]});
				let values = value.split(/\s*\|\s*/);
				let keys = variable.split('|');
				// @ts-ignore
				if (keys.length && values.length) variables[keys.shift()??''] = values.shift();
				// @ts-ignore
				if (keys.length > 1 && values.length) variables[keys.pop()??''] = values.pop();
				while (keys.length > 1 && values.length) {
					// @ts-ignore
					if (keys.length && values.length) variables[keys.pop()??''] = values.pop();
				}
				if (keys.length == 1) {
					variables[keys[0]] = values.join(' | ');
				}

			} else {
				let pattern_match_end: number = template[ti] ? input.substring(ii).indexOf(end_match) : -1;
				let value: string = input.substring(ii, pattern_match_end != -1 ? ii+pattern_match_end : undefined);
				console.log({variable, value, pattern_match_end, char: template[ti]});
				
				ii += value.length;
				if (value) variables[variable] = value;
			}


		} else if (t_char != i_char) {
			return null;
		}
		ii++;
	}
	for (let key in variables) {
		if (!key || !variables[key]) delete variables[key];
	}
	return variables;
}
function splitString(input: string): string[] {
    const regex = /"([^"]+)"|\S+/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
        if (match[1]) {
            matches.push(match[1]);
        } else {
            matches.push(match[0]);
        }
    }
    return matches;
}

export class Issue {
	type: IssueType
	original_message: string
	
	category: string
	severity: 'warning'|'error'
	text?: string
	asset_type?: string
	asset_id?: string
	resource_type?: string
	resource_id?: string
	values: Record<string, string>

	constructor(input: string) {
		this.original_message = input;
		this.values = {};

		let tags_section = input.match(/^(\[\w+\])+/)?.[0];
		if (tags_section) {
			let tags = tags_section.replace(/\[/g, '').split(']').filter(tag => tag);

			if (tags[0]) this.category = tags[0];
			if (this.category == 'Actor') this.category = 'Entity';

			if (tags[1]) this.severity = tags[1] == 'error' ? 'error' : 'warning';
			input = input.substring(tags_section.length+1).replace(/[\r\n]+/g, '');
		}

		for (let type of IssueTypes) {
			let variables = type.pattern && extractVariables(type.pattern, input);
			if (variables) {
				this.type = type;

				this.asset_type = variables.asset_type ?? type.values?.asset_type ?? '';
				this.asset_id = variables.asset_id ?? type.values?.asset_id ?? '';
				this.resource_type = variables.resource_type ?? type.values?.resource_type ?? '';
				this.resource_id = variables.resource_id ?? type.values?.resource_id ?? '';

				delete variables.asset_type;
				delete variables.asset_id;
				delete variables.resource_type;
				delete variables.resource_id;
				if (variables) Object.assign(this.values, variables);

				break;
			}
		}
		if (this.resource_type && TypeAliases[this.resource_type]) {
			this.resource_type = TypeAliases[this.resource_type];
		}
		if (this.type?.category) {
			this.category = this.type.category;
		}
		
		if (!this.type && this.category == 'Scripting') {
			this.text = input;
			if (this.severity == 'warning') {
				this.type = IssueTypeScriptWarning;
			} else {
				this.type = IssueTypeScriptError;
			}
		} else if (!this.type) {
			this.type = IssueTypeUnknown;
			this.values.message = this.original_message;
		}

		if (!Issue.all.find(iss2 => iss2.original_message == this.original_message || iss2.sameAs(this))) {
			Issue.all.push(this);
		}
	}
	filter(search_term: string): boolean {
		if (!search_term) return true;

		let segments = splitString(search_term.toLowerCase());
		let own_values = [
			this.type.name, this.original_message,
			this.asset_id, this.asset_type, this.resource_id, this.resource_type,
		];
		for (let key in this.values) {
			own_values.push(this.values[key]);
		}
		own_values = own_values.map(v => v?.toLowerCase());
		for (let term of segments) {
			let match = false;
			for (let value of own_values) {
				if (value && value.indexOf(term) != -1) {
					match = true;
					break;
				}
			}
			if (match == false) return false;
		}
		return true;
	}
	sameAs(other: Issue): boolean {
		if (this.asset_type != other.asset_type) return false;
		if (this.asset_id != other.asset_id) return false;
		if (this.resource_type != other.resource_type) return false;
		if (this.resource_id != other.resource_id) return false;
		if (this.category != other.category) return false;
		if (this.severity != other.severity) return false;
		if (this.text != other.text) return false;
		for (let key in this.values) {
			if (this.values[key] != other.values[key]) return false;
		}
		return true;
	}

	static all: Issue[] = [];
}


export function parseLog(log: string) {
	Issue.all.splice(0, Infinity);

	let lines = log.split(/[\r\n]+\[/g);
	for (let line of lines) {
		console.log(line)
		if (line && line.length > 5) {
			console.log(line)
			new Issue(line.startsWith('[') ? line : ('['+line));
		}
	}
	console.log(Issue.all)
}