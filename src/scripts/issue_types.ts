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
	}
}
export const IssueTypes: IssueType[] = [
	{
		id: 'geometry_not_found',
		pattern: '{asset_id} | {asset_id} | geometry not found?',
		name: 'Geomtry missing',
		description: 'A block or entity referenced a geometry which could not be found.',
		values: {
            resource_type: 'geometry'
        }
	},
	{
		id: 'render_controller_not_found',
		pattern: '{asset_id} | {asset_id} | Invalid render controller: {resource_id}',
		name: 'Render Controller missing',
		description: 'An entity referenced a render controller which could not be found.',
		values: {
            resource_type: 'render_controller'
        }
	},
	{
		id: 'blocks_json_block_missing',
		pattern: 'The block named {asset_id} used in a "blocks.json" file does not exist in the registry',
		name: 'Block name used in "blocks.json" does not exist',
		values: {
            resource_type: 'block'
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
    }
];

export const IssueTypeUnknown = {
    id: 'blocks_json_block_missing',
    name: 'Other issue',
    values: {
    }
};