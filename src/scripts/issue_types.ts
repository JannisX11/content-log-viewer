export interface IssueType {
	id: string
	name: string
	pattern?: string
	description?: string
	values?: {
        asset_type?: string
        asset_id?: string
        resource_type?: string
        resource_id?: string
        [key: string]: string | undefined
	}
}
export const IssueTypes: IssueType[] = [
    // Entity
	{
		id: 'geometry_not_found',
		pattern: '{asset_id} | {asset_id} | geometry not found?',
		name: 'Geomtry missing',
		description: 'A block or entity referenced a geometry which could not be found.',
		values: {
            asset_type: 'entity',
            resource_type: 'geometry'
        }
	},
	{
		id: 'render_controller_not_found',
		pattern: '{asset_id} | {asset_id} | Invalid render controller: {resource_id}',
		name: 'Render Controller missing',
		description: 'An entity referenced a render controller which could not be found.',
		values: {
            asset_type: 'entity',
            resource_type: 'render_controller'
        }
	},
	{
		id: 'blocks_json_block_missing',
		pattern: 'The block named {asset_id} used in a "blocks.json" file does not exist in the registry',
		name: 'Block name used in "blocks.json" does not exist',
		values: {
            asset_type: 'block',
            resource_type: 'block',
            file_path: 'blocks.json'
        }
	},
    {
        id: 'particle_not_found',
        pattern: "{asset_id} | Entity .json '{asset_id}' referenced particle '{resource_id}' that doesn't exist",
        name: 'Particle effect missing',
        description: 'An entity referenced a render controller that could not be found',
        values: {
            asset_type: 'entity',
            resource_type: 'particle',
        }
    },
    {
        id: 'material_not_found',
        pattern: '{file_path} | Material "{resource_id}" is referenced in file "{file_path}" but not defined.',
        name: 'Material is missing',
        values: {
            asset_type: 'entity',
            resource_type: 'material'
        }
    },
    {
        id: 'friendly_name_not_found',
        pattern: "{asset_id} | {asset_id} | {resource_id} | {resource_type} | friendly name '{value}' not found in entity friendly name list ({list}) - check your spelling?",
        name: 'Friendly name not found in entity',
        values: {
            asset_type: 'entity',
        }
    },
    {
        id: 'duplicate_locator',
        pattern: "{asset_id} | {asset_id} | Locator: Error: model already has a locator {value} that doesn't exactly match the one wanting to be added - skipping new definition in {resource_id}",
        name: 'Duplicate Locator',
        values: {
            asset_type: 'entity',
            resource_type: 'geometry'
        }
    },

    // Block
    {
        id: 'unknown_block_component',
        pattern: "Component '{resource_id}' was not registered in script but used on a block",
        name: 'Unregistered Block Component',
        values: {
            asset_type: 'block',
            resource_type: 'block_component'
        }
    },
    {
        id: 'block_baked_material',
        pattern: 'A block must have baked material data in order to tessellate!',
        name: 'Block must have a baked material',
        values: {
            asset_type: 'block'
        }
    },
    {
        id: 'block_geometry_not_found',
        pattern: "Block name = '{asset_id}' | Error with geometry component: cannot find {resource_id} geometry JSON.",
        name: 'Block Geometry is missing',
        values: {
            asset_type: 'block',
            resource_type: 'geometry',
        }
    },
    {
        id: 'block_geometry_not_found',
        pattern: "Block name = '{asset_id}' | Geometry file `{resource_id}` doesn't exist",
        name: 'Block Geometry is missing',
        values: {
            asset_type: 'block',
            resource_type: 'geometry',
        }
    },

    // JSON
    {
        id: 'invalid_json',
        pattern: "Error parsing {file_path} :",
        name: 'JSON Parsing Error'
    },
    {
        id: 'invalid_json_field',
        pattern: "{file_path} | {json_path} | {value} | child '{value}' not valid here.",
        name: 'Invalid JSON Field'
    },
    {
        id: 'json_field_not_found',
        pattern: '{file_path} | {json_path} | {json_path2} | Required child {key} not found',
        name: 'Required child missing in JSON',
    },
    {
        id: 'file_not_validated',
        pattern: "{file_path} | {resource_type} file didn't validate",
        name: 'Invalid file'
    },
    {
        id: 'invalid_file',
        pattern: 'error parsing {file_path}:* {text_position}',
        name: 'Error parsing file'
    },
    {
        id: 'invalid_client_biome',
        pattern: "Invalid Client Biome file {file_path}: {json_path}: this member was found in the input, but is not present in the Schema",
        name: 'Invalid Client Biome'
    }
];

export const IssueTypeScriptWarning = {
    id: 'script_warning',
    name: 'Script Warning',
    values: {
    }
};
export const IssueTypeScriptError = {
    id: 'script_error',
    name: 'Script Error',
    values: {
    }
};
export const IssueTypeUnknown = {
    id: 'unknown',
    name: 'Other issue',
    values: {
    }
};


export const TypeLabels: Record<string, string> = {
    entity: 'Entity',
    block: 'Block',
    item: 'Item',
    render_controller: 'Render Controller',
}