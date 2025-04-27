<script setup>

</script>

<template>
	<div id="wrapper" >
		<header>
			<h1>Content Log Viewer</h1>
			<button @click="pasteLog()">Paste Log</button>
		</header>
		<div id="list_section">
			<div class="search_bar">
				<input type="text" v-model="search_term">
				<Search v-if="!search_term" :size="20" />
				<X v-else :size="20" @click="search_term = ''" />
			</div>
			<ul class="group_bar">
				<li v-for="(value, key) in group_categories" @click="groupBy(key)" :class="{selected: group_by == key}" :title="'Group by: ' + value">{{ value }}</li>
				<span style="margin-left: auto;">{{ groups.length }} ({{ issues.length }})</span>
			</ul>
			<ul class="issue_group_list">
				<li class="issue_group"
					v-for="group of groups"
					@click="selected_group = group.key"
					:class="{selected: selected_group == group.key}"
				>
					<div class="issue_group_header">
						<div class="issue_group_toggle issue_icon" @click="toggleGroup(group)">
							<ChevronRight v-if="group_opened[group.key] != true" :size="20" />
							<ChevronDown v-else :size="20" />
						</div>
						<div class="severity issue_icon" v-if="group.severity">
							<AlertTriangle v-if="group.severity == 'warning'" style="color: var(--color-warning)" :size="20" />
							<AlertCircle v-else style="color: var(--color-error)" :size="20" />
						</div>
						<span class="issue_group_count">{{ group.issues.length }}</span>
						<label class="group_type_tag" v-if="group.type">{{ type_labels[group.type] ?? group.type }}</label>
						<label @click="toggleGroup(group)">{{ group.name }}</label>
						<div class="issue_icon clear_button" @click="clearGroup(group)">
							<Trash :size="20" />
						</div>
					</div>
					<ul v-if="group_opened[group.key]">
						<li v-for="issue in group.issues" class="issue" @click.stop="selectIssue(issue)">
							<div class="severity issue_icon" v-if="issue.severity">
								<AlertTriangle v-if="issue.severity == 'warning'" style="color: var(--color-warning)" :size="20" />
								<AlertCircle v-else style="color: var(--color-error)" :size="20" />
							</div>

							<template v-if="group_by != 'issue'">
								<span class="field_value">{{ issue.type.name }}</span>
							</template>
							<template v-if="issue.text">
								<label class="field_label">Message</label>
								<span class="field_value">{{ issue.text }}</span>
							</template>
							<template v-if="issue.asset_id">
								<label class="field_label">{{ type_labels[issue.asset_type??''] ?? 'ID' }}</label>
								<span class="field_value">{{ issue.asset_id }}</span>
							</template>
							<template v-if="issue.resource_id">
								<label class="field_label">{{ type_labels[issue.resource_type??''] ?? 'ID' }}</label>
								<span class="field_value">{{ issue.resource_id }}</span>
							</template>
							<template v-for="(value, key) in issue.values">
								<label class="field_label">{{ value_labels[key] || key }}</label>
								<span class="field_value" :class="{limited_length: key == 'file_path'}">{{ value }}</span>
							</template>

							<div class="issue_icon clear_button" @click="clearIssue(issue)">
								<Trash :size="20" />
							</div>
						</li>
					</ul>
				</li>
				<template v-if="groups.length == 0">No issues...</template>
			</ul>
		</div>
	</div>
</template>


<script lang="ts">

import { Plus, Search, Trash, X, AlertTriangle, AlertCircle, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { Issue, parseLog } from './scripts/parse_log'
import { IssueTypes, TypeLabels, ValueLabels } from './scripts/issue_types';

/*
// @ts-ignore
import demo_log from './../log samples/all.txt?raw'
parseLog(demo_log);
*/

const collator = new Intl.Collator('en');


type IssueGroup = {
	key: string
	name: string
	issues: Issue[],
	type?: string
	severity?: string
}

export default {
	components: {
		Plus,
		Search,
		Trash,
		X,
		AlertTriangle,
		AlertCircle,
		ChevronRight,
		ChevronDown
	},
	data() {
		return {
			group_by: 'issue',
			search_term: '',
			issues: Issue.all,
			selected_group: null as null|string,
			selected_issue: null as null|string,
			group_opened: {} as Record<string, boolean>,
			group_categories: {
				issue: 'Issue',
				category: 'Category',
				asset: 'Object',
				resource: 'Resource',
			},
			type_labels: TypeLabels,
			value_labels: ValueLabels,
		}
	},
	methods: {
		groupBy(v) {
			this.group_by = v;
		},
		async pasteLog() {
			let text = await navigator.clipboard.readText();
			parseLog(text);
			this.update();
		},
		update() {
			console.log('UPDATE')
			let g = this.group_by;
			this.group_by = 'a';
			this.group_by = g;
		},
		toggleGroup(group) {
			this.group_opened[group.key] ? delete this.group_opened[group.key] : this.group_opened[group.key] = true;
		},
		clearGroup(group: IssueGroup) {
			let issue_ids = group.issues.map(issue => issue.original_message);
			let filtered_issues = Issue.all.filter(issue => !issue_ids.find(id => issue.original_message == id));
			this.issues.splice(0, Infinity, ...filtered_issues);
			this.update();
		},
		clearIssue(issue: Issue) {
			let filtered_issues = Issue.all.filter(is2 => is2.original_message != issue.original_message);
			this.issues.splice(0, Infinity, ...filtered_issues);
			this.update();
		},
		selectIssue(issue: Issue) {
			this.selected_issue = issue.original_message;
			console.log(issue);
		}
	},
	computed: {
		groups(): IssueGroup[] {
			let groups: Record<string, IssueGroup|undefined> = {};

			// Establish group order
			if (this.group_by == 'issue') {
				for (let issue_type of IssueTypes) {
					groups[issue_type.id] = undefined;
				}
				groups.script_warning = undefined;
				groups.script_error = undefined;
			}

			// Create groups
			for (let issue of this.issues) {
				if (issue.filter(this.search_term) == false) continue;

				if (this.group_by == 'issue') {
					let key = issue.type.id;
					if (!groups[key]) {
						groups[key] = {
							key,
							name: issue.type.name,
							issues: [],
							severity: issue.severity
						};
					}
					groups[key].issues.push(issue);

				} else if (this.group_by == 'category') {
					let key = issue.category || ''
					if (!groups[key]) {
						groups[key] = {
							key,
							name: issue.category || 'Other',
							issues: [],
						};
					}
					groups[key].issues.push(issue);

				} else if (this.group_by == 'asset') {
					let key = issue.asset_id || ''
					if (!groups[key]) {
						groups[key] = {
							key,
							name: issue.asset_id || 'Other',
							type: issue.asset_type,
							issues: [],
						};
					}
					groups[key].issues.push(issue);

				} else if (this.group_by == 'resource') {
					let key = issue.resource_id || ''
					if (!groups[key]) {
						groups[key] = {
							key,
							name: issue.resource_id || 'Other',
							type: issue.resource_id ? issue.resource_type : '',
							issues: [],
						};
					}
					groups[key].issues.push(issue);
				}
			}
			let groups_list = Object.keys(groups).map(key => groups[key]).filter(g => typeof g == 'object');
			if (this.group_by == 'asset') {
				groups_list.sort((a, b) => collator.compare(a.type!, b.type!));
			}
			return groups_list;
		}
	},
	mounted() {
		document.addEventListener('paste', (event) => {
			const pasted_text = event.clipboardData?.getData('text');
			if (pasted_text) {
				parseLog(pasted_text);
				this.update();
			}
		});
	}
}
</script>

<style scoped>


#wrapper {
	height: 100%;
	display: grid;
	grid-template-rows: 40px auto;
	grid-template-columns: 100%;
	grid-template-areas: 
		"header"
		"list";
}
header {
	grid-area: header;
	border-bottom: 1px solid var(--color-border);
	display: flex;
	align-items: center;
	gap: 12px;
}
h1 {
	font-size: 22px;
	padding: 0 18px;
	color: var(--color-subtle);
	overflow: hidden;
	flex-shrink: 1;
}
header .tool {
	min-width: 90px;
}
#list_section {
	grid-area: list;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 1000px;
	margin: 0 auto;
}
.group_bar {
	display: flex;
	padding: 5px 8px;
	gap: 6px;
	list-style: none;
	align-items: center;
}
.group_bar > li {
	background-color: var(--color-editor);
	border-radius: 5px;
	padding: 5px 12px;
	text-align: b;
	cursor: pointer;
}
.group_bar > li:hover {
	background-color: var(--color-hover);
}
.group_bar > li.selected {
	background-color: var(--color-accent);
	color: black;
}
.search_bar {
	margin: 8px 10px;
	position: relative;
}
.search_bar > input {
	width: 100%;
	height: 40px;
	border-radius: 20px;
	padding: 5px 16px;
}
.search_bar > svg {
	position: absolute;
	top: 0;
	bottom: 0;
	right: 14px;
	margin: auto;
}
.issue_icon {
	display: block;
    text-align: center;
    width: 32px;
    /* height: 30px; */
    padding-top: 5px;
	flex-shrink: 0;
}
.clear_button {
	margin-left: auto;
	margin-right: 3px;
	cursor: pointer;
}
.clear_button:hover {
	color: var(--color-highlight);
}
.issue_group_list {
	overflow-y: auto;
	flex-grow: 1;
}
.issue_group {
	background: var(--color-editor);
    margin: 5px;
    padding: 4px 2px;
    border-radius: 20px;
}
.issue_group button {
	border-radius: 20px;
	padding: 4px 16px;
}
.issue_group_header {
	display: flex;
	padding: 4px;
	align-items: center;
}
.issue_group_toggle {
	cursor: pointer;
	color: var(--color-placeholder);
}
.issue_group_toggle:hover {
	color: var(--color-text);
}
.issue_group_count {
    color: var(--color-placeholder);
    margin: 0 4px;
    min-width: 25px;
}
.issue_group_header > label {
	flex-grow: 1;
}
.issue_group_header > label.group_type_tag {
    flex-grow: 0;
    padding: 1px 6px;
    margin-right: 8px;
    font-weight: 600;
    border: 1px solid var(--color-border);
    border-radius: 8px;
}

.issue {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
    margin: 5px;
	padding: 5px;
	border-radius: 18px;
    background: var(--color-background);
}
.field_label {
	padding: 0 4px;
    margin-right: 4px;
    margin-left: 10px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
}
.field_label:after {
	content: ":";
}
.field_value {
	overflow-wrap: break-word;
    max-width: 100%;
}
.field_value.limited_length {
	overflow-wrap: unset;
	overflow: hidden;
    max-width: min(420px, 100%);
    white-space: nowrap;
}

@media only screen and (max-width: 800px) {
}

</style>
