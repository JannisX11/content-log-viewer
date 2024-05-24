/*
[Geometry][error]-spark:invisible_boat_car | spark:invisible_boat_car | geometry not found?

[Geometry][error]-spark:sb_door_window | spark:sb_door_window | Invalid render controller: controller.render.spark.furniture

[Texture][warning]-The block named spark.sponge:mr_krabs_black_floor used in a "blocks.json" file does not exist in the registry

*/
interface IssueType {
	pattern: RegExp
	name: string
}
const IssueTypes: {[type: string]: IssueType} = {
	geometry_not_found: {
		pattern: /(geometry) not found/,
		name: 'Geomtry not found',
	},
	invalid_asset: {
		pattern: /Invalid render controller:/,
		name: 'Invalid Render Controller',
	},
	blocks_json_block_missing: {
		pattern: /The block named [\w.-]+ used in a "blocks\.json" file does not exist in the registry/,
		name: 'Block name used in "blocks.json" does not exist',
	}
}

class Issue {
	type: IssueType
	severity: 'warning'|'error'
	asset_type: string
	asset_identifier: string
	text: string

	constructor(input: string) {
		let tags_section = input.match(/^(\[\w+\])+/)?.[0];
		if (tags_section) {
			let tags = tags_section.replace(/\[/, '').split(']').filter(tag => tag);
			if (tags[0]) this.asset_type = tags[0];
			if (this.asset_type == 'Actor') this.asset_type = 'Entity';
			if (tags[1]) this.severity = tags[1] == 'error' ? 'error' : 'warning';
			input = input.substring(tags_section.length+1);
		}

		if (this.asset_type == 'Scripting' && this.severity == 'warning') {
			this.text = input;
		} else {
			let path_sections = input.split(/ | /g);
			let main = path_sections.pop();
			if (path_sections[0]) this.asset_identifier = path_sections[0];

			for (let type_id in IssueTypes) {
				let type = IssueTypes[type_id]
			}

		}
	}
}s


export function parseLog(log: string): Issue[] {
	let lines = log.split(/\n+/);
	let issues = lines.map(line => new Issue(line));

	return issues;
}