import { Issue } from "./parse_log"

type Info = string | {
    text: string
    if(issue: Issue): boolean
}
export interface IssueType {
    /**
     * The ID of the issue type. Should be snake case.
     * Multiple issue types can have the same ID in edge cases if the information they convey is identical
     */
	id: string
    /**
     * The display name of the issue, should be short but explain what the issue is.
     */
	name: string
    /**
     * The pattern to match an issue.
     * Should be the log output minus the "[category][severity]-" part at the start.
     * A variable name in curly brackets can be used to extract a variable out of the log message.
     * In edge cases a pattern like {file_path|json_path+|value} can be used to match a log message that includes multiple sections separated by " | " where the exact number of segments is unknown. A + symbol at the end of a variable name indicates which variable acts as the catch-all. Only one variable per pattern can be a catch-all.
     * @example Block name = '{asset_id}' | Error with geometry component: cannot find {resource_id} geometry JSON.
     */
	pattern?: string
    /**
     * A more in-depth description about the issue and what is causing it. Should be 1-3 sentences as a rough guideline.
     */
	description?: string
    /**
     * An override for the issue category, indicating which system the issue belongs to.
     * Usually the category is provided by Minecraft in square brackets at the start of a log message. This field should only be used if the category provided by Minecraft is unintuitive.
     */
    category?: string
    /**
     * Set default values to fields of the issue that are known by the issue type regardless of the exact log message.
     */
	values?: {
        /**
         * Asset type describes the type of asset/object involved in the issue. E. g. a block, entity, biome etc.
         */
        asset_type?: string
        /**
         * Asset ID is the identifier of the asset/object
         */
        asset_id?: string
        /**
         * Resource type is the type of resource that contains the issue, e. g. geometry, animation etc.
         */
        resource_type?: string
        /**
         * Resource ID is the identifier of the affected resource
         */
        resource_id?: string
        /**
         * Other values can be provided
         */
        [key: string]: string | undefined
	},
    /**
     * Process certain variables before displaying them
     */
    process?: {
        [key: string]: (input: string) => string
    }
    /**
     * Additional info about an error or warning, including but not limited to unintuitive causes for the issue, side effects, and infos how to avoid or solve it.
     * Individual info lines can also be conditioned to only appear if certain conditions about the issue are met.
     */
    info?: Info[]
}


/**
 * List of all possible issue types. Should be sorted by category as much as possible
 */
export const IssueTypes: IssueType[] = [
    // Entity
	{
		id: 'geometry_not_found',
		pattern: '{asset_id} | {asset_id} | geometry not found?',
		name: 'Geometry missing',
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
        category: 'Blocks',
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
        pattern: "{asset_id} | {asset_id} | {resource_id} | {scope} | friendly name '{name}' not found in entity friendly name list ({names}) - check your spelling?",
        name: 'Friendly name not found in entity',
        values: {
            resource_type: 'render_controller',
            asset_type: 'entity',
        }
    },
    {
        id: 'friendly_name_not_found',
        pattern: "friendly name '{name}' not found in entity friendly name list ({names}) - check your spelling?",
        name: 'Friendly name not found in entity',
        values: {
            resource_type: 'render_controller',
            asset_type: 'entity',
        }
    },
    {
        id: 'duplicate_locator',
        pattern: "{asset_id} | {asset_id} | Locator: Error: model already has a locator {name} that doesn't exactly match the one wanting to be added - skipping new definition in {resource_id}",
        name: 'Duplicate Locator',
        values: {
            asset_type: 'entity',
            resource_type: 'geometry'
        },
        info: [
            {if: issue => issue.values.name == 'armor_offset.default_neck', text: 'The locator "armor_offset.default_neck" gets added automatically when a geometry has a bone called "head". This is a Minecraft bug, but does not seem to cause issues in practice. One workaround is to avoid naming bones "head".'},
            'The error message is thrown when an entity uses multiple geometries that each add a locator of the same name.',
            'To avoid it, either all bone names and pivots of the affected geometries need to be identical, or locators with unique names must be used.',
            'This issue can cause locators to end up in unexpected locations',
        ]
    },
    {
        id: 'animation_not_found',
        pattern: "Error: can't find animation {resource_id}",
        name: 'Animation is missing',
        values: {
            asset_type: 'entity',
            resource_type: 'animation'
        }
    },
    {
        id: 'animation_not_found',
        pattern: "{asset_id} | Error: can't find animation {resource_id}",
        name: 'Animation is missing',
        values: {
            asset_type: 'entity',
            resource_type: 'animation'
        }
    },

    // Entity behavior
    {
        id: 'load_properties_error',
        pattern: "{pack_name} | actor_definitions | {file_path} | {asset_id} | minecraft:entity | description | Error loading Actor Properties",
        name: 'Error loading Entity Properties',
        values: {
            asset_type: 'entity'
        }
    },
    {
        id: 'load_properties_error',
        pattern: "Actor {asset_id} does not have any properties",
        name: 'Error loading Entity Properties',
        values: {
            asset_type: 'entity'
        }
    },
    {
        id: 'property_float_type',
        pattern: "{pack_name} | actor_definitions | {file_path} | {asset_id} | minecraft:entity | description | Error loading property '{name}': {key} should contain only '{correct_type}' type elements",
        name: 'Property uses integers instead of floats'
    },
    {
        id: 'failed_to_load_spawn_rules',
        pattern: '{pack_name} | Failed to load spawn rules',
        name: 'Failed to load spawn rules'
    },
    {
        id: 'damage_source_not_found',
        pattern: "{pack_name} | actor_definitions | {file_path|json_path+} | Damage Source not found: {name}",
        name: 'Damage source invalid'
    },
    {
        id: 'behavior_particle_not_found',
        pattern: "{pack_name} | actor_definitions | {file_path|json_path+} | Invalid particle type {name} specified.",
        name: 'Invalid particle type',
        values: {
            asset_type: 'entity',
            resource_type: 'particle'
        },
        info: [
            'Only vanilla particle types such as "snowballpoof" are valid here'
        ]
    },

    // Molang
    {
        id: 'property_not_found',
        pattern: "{context|} | Error: {expression} called on an actor without a property component.",
        name: 'Property missing'
    },
    {
        id: 'molang_operator_missing_parameters',
        pattern: "{pack_name} | {file_path|json_path+|expression} operator (math, query, loop, etc) with empty parameter list should have failed to parse",
        name: 'Missing Molang parameters'
    },

    // Block
    {
        id: 'unknown_block_component',
        pattern: "Component '{resource_id}' was not registered in script but used on a block",
        name: 'Unregistered Block Component',
        values: {
            asset_type: 'block',
            resource_type: 'block_component'
        },
        info: [
            'This can potentially be caused by the script not loading at all, or by the component registration code not running correctly within the "worldInitialize" event in scripting v1.'
        ]
    },
    {
        id: 'block_baked_material',
        pattern: 'A block must have baked material data in order to tessellate!',
        name: 'Block must have a baked material',
        values: {
            asset_type: 'block'
        },
        info: [
            'The error message does not specify which block is affected.'
        ]
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
    {
        id: 'unknown_block_referenced',
        pattern: "Unknown block during Deferred BlockDescriptor resolution: {asset_id}",
        name: 'Unknown or incorrect block identifier referenced',
        values: {
            asset_type: 'block',
        },
        info: [
            'An unknown block identifier was referenced in a JSON file such as a behavior entity file or spawn rule.'
        ]
    },
    // Item
    {
        id: 'item_json_field_invalid',
        pattern: "{asset_id} -> {json_path}: this member was found in the input, but is not present in the Schema",
        name: 'Invalid JSON Field',
        values: {
            asset_type: 'item'
        }
    },
    {
        id: 'missing_referenced_asset',
        pattern: "{json_path}: Missing referenced asset",
        name: 'Referenced Asset is missing',
        values: {
            asset_type: 'item'
        }
    },
    {
        id: 'missing_referenced_asset',
        pattern: " -> {json_path} Missing referenced asset {asset}",
        name: 'Referenced Asset is missing',
        values: {
            asset_type: 'item'
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
        pattern: "{file_path|json_path+|value} | child '{value}' not valid here.",
        name: 'Invalid JSON Field'
    },
    {
        id: 'invalid_json_type',
        pattern: "{file_path|json_path+|name} | unknown child schema option type.  Allowed types:  '{correct_type}'",
        name: 'Invalid JSON value type',
    },
    {
        id: 'json_field_not_found',
        pattern: '{file_path|json_path+} | Required child {key} not found',
        name: 'Required child missing in JSON',
    },
    {
        id: 'file_not_validated',
        pattern: "{file_path} | {resource_type} file didn't validate",
        name: 'Invalid file'
    },
    {
        id: 'invalid_file',
        pattern: 'error parsing {file_path}:* {json_error}',
        name: 'Error parsing file'
    },
    {
        id: 'invalid_client_biome',
        pattern: "Invalid Client Biome file {file_path}: {json_path}: this member was found in the input, but is not present in the Schema",
        name: 'Invalid Client Biome'
    },

    // Dialogue
    {
        id: 'duplicate_dialogue',
        pattern: "{file_path} | JSON: {file_name} has an error:  A scene with a scene name of '{name}' already exists. Skipping scene...",
        name: 'Duplicate scene name',
        values: {
            asset_type: 'dialogue'
        }
    },

    // Sound
    {
        id: 'sound_event_not_found',
        pattern: "Unable to find event [{resource_id}] to play attached. Please check that the event name exists in sound_definitions.json",
        name: 'Sound event missing',
        values: {
            file_path: 'sounds/sound_definitions.json',
            resource_type: 'sound_event'
        }
    },

    // Structure
    {
        id: 'jigsaw_pool_not_found',
        pattern: "[[Jigsaw Structure]] couldn't be constructed, no pool named `{resource_id}`",
        name: 'Incorrect Jigsaw Pool',
        values: {
            resource_type: 'jigsaw_pool'
        }
    },

    // Commands
    {
        id: 'failed_to_load_function',
        pattern: "Function {resource_id} failed to load correctly with error(s):",
        name: 'Failed to load function',
        values: {
            resource_type: 'function'
        }
    },
    {
        id: 'unknown_command',
        pattern: "Error on line {line}: unknown or invalid command '{command}'",
        name: 'Unknown Command'
    },
    {
        id: 'command_syntax_error',
        pattern: `Error on line {line}: command failed to parse with error 'Syntax error: {message}'`,
        name: 'Command Syntax Error'
    },

    // UI
    {
        id: 'ui_no_binding_name',
        pattern: '{ui_controls+|ui_path} | JSON UI parse failure: Must define a binding name!',
        process: {
            ui_path: (input) => {return input.replace(/On Control Path: /, '');},
            ui_controls: (input) => {return input.replace(/UI Control: /g, '');}
        },
        name: 'UI binding name missing',
        description: 'Error parsing JSON UI. A binding name must be defined',
    },
    {
        id: 'ui_no_property_in_data_binding',
        pattern: '{ui_controls+|ui_path} | Data bindings must have at least one property to bind!',
        process: {
            ui_path: (input) => {return input.replace(/On Control Path: /, '');},
            ui_controls: (input) => {return input.replace(/UI Control: /g, '');}
        },
        name: 'No property in UI data binding',
        description: 'No property was found. Data bindings must have at least one property to bind.',
    },
];

export const IssueTypeScriptLog = {
    id: 'script_log',
    name: 'Script Log',
    values: {
    }
};
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

/**
 * Display strings for how types of assets or resources are labeled in the UI
 */
export const TypeLabels: Record<string, string> = {
    entity: 'Entity',
    block: 'Block',
    item: 'Item',
    asset: 'Asset',
    render_controller: 'Render Controller',
    block_component: 'Block Component',
    material: 'Material',
    geometry: 'Geometry',
    texture: 'Texture',
    animation: 'Animation',
    animation_controller: 'Animation Controller',
    particle: 'Particle',
    sound_event: 'Sound Event',
    jigsaw_pool: 'Jigsaw Pool',
}
export const TypeAliases: Record<string, string> = {
    Materials: 'material',
    Textures: 'texture',
    Geometries: 'geometry'
}

/**
 * Display labels for variables that are extracted from log messages
 */
export const ValueLabels: Record<string, string> = {
    message: 'Message',
    file_path: 'File',
    json_path: 'JSON Path',
    pack_name: 'Pack Name',
    name: 'Name',
    value: 'Value',
    names: 'Names',
    render_controller: 'Render Controller',
    expression: 'Expression',
    json_error: 'JSON Error',
    correct_type: 'Expected Type',
    scope: 'Scope',
    line: 'Line',
    command: 'Command',
    ui_controls: 'UI Controls',
    ui_path: 'UI Path',
}
