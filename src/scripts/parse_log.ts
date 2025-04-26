import { IssueType, IssueTypes, IssueTypeUnknown } from "./issue_types"


function extractVariables(template: string, input: string): Record<string, string> | null {
	let variables: Record<string, string> = {};
    for (let ti = 0, ii = 0; ti < template.length; ti++) {
		let t_char = template[ti];
		let i_char = input[ii];
		if (t_char == '{') {
			let var_end: number = template.substring(ti).search('}');
			let variable: string = template.substring(ti+1, ti+var_end);
			ti += var_end+1;
			let pattern_match_end: number = template[ti] ? input.substring(ii).search(template[ti]) : -1;
			let value: string = input.substring(ii, pattern_match_end != -1 ? ii+pattern_match_end : undefined);
			ii += value.length;
			if (value) variables[variable] = value;
		} else if (t_char != i_char) {
			return null;
		}
		ii++;
	}
	return variables;
}

export class Issue {
	type: IssueType
	original_message: string
	
	severity: 'warning'|'error'
	asset_type?: string
	asset_id?: string
	resource_type?: string
	resource_id?: string
	text?: string

	constructor(input: string) {
		this.original_message = input;

		let tags_section = input.match(/^(\[\w+\])+/)?.[0];
		if (tags_section) {
			let tags = tags_section.replace(/\[/g, '').split(']').filter(tag => tag);
			if (tags[0]) this.resource_type = tags[0];
			if (this.asset_type == 'Actor') this.asset_type = 'Entity';
			console.log(tags[1], tags[1] == 'error')
			if (tags[1]) this.severity = tags[1] == 'error' ? 'error' : 'warning';
			input = input.substring(tags_section.length+1);
		}

		if (this.resource_type == 'Scripting' && this.severity == 'warning') {
			this.text = input;
		} else {
			for (let type of IssueTypes) {
				let variables = type.pattern && extractVariables(type.pattern, input);
				if (variables) {
					this.type = type;
					this.asset_type = variables.asset_type ?? type.values?.asset_type ?? '';
					this.asset_id = variables.asset_id ?? type.values?.asset_id ?? '';
					this.resource_type = variables.resource_type ?? type.values?.resource_type ?? '';
					this.resource_id = variables.resource_id ?? type.values?.resource_id ?? '';
					break;
				}
			}
		}

		if (!this.type) this.type = IssueTypeUnknown;

		if (!Issue.all.find(iss2 => iss2.original_message == this.original_message)) {
			Issue.all.push(this);
		}
	}
	filter(search_term: string): boolean {
		if (!search_term) return true;

		return false;
	}

	static all: Issue[] = [];
}


export function parseLog(log: string): Issue[] {
	Issue.all.splice(0, Infinity);

	let lines = log.split(/\n+\s*/);
	let issues = lines.map(line => new Issue(line));
	console.log(issues)

	return issues;
}