<script setup lang="ts">
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
					:key="group.key"
					@click="selected_group = group.key"
					:class="{selected: selected_group == group.key}"
				>
					<div class="issue_group_header">
						<div class="issue_group_toggle issue_icon" @click="toggleGroup(group)">
							<ChevronRight v-if="group_opened[group.key] != true" :size="20" />
							<ChevronDown v-else :size="20" />
						</div>
						<div class="severity issue_icon" v-if="group.severity">
							<SeverityIcon :severity="group.severity" :size="20" />
						</div>
						<span class="issue_group_count">{{ group.issues.length }}</span>
						<label class="group_type_tag" v-if="group.type">{{ type_labels[group.type] ?? group.type }}</label>
						<label @click="toggleGroup(group)">{{ group.name }}</label>
						<div class="issue_icon clear_button" @click="clearGroup(group)">
							<Trash :size="20" />
						</div>
					</div>
					<p v-if="group.issue_type?.description && group_opened[group.key]" class="description">{{ group.issue_type?.description }}</p>
					<ul v-if="group_opened[group.key]">
						<li v-for="issue in group.issues"
							class="issue"
							:class="{selected: issue == selected_issue}"
							:key="issue.original_message + issue.timestamp"
							@pointerdown.stop="pointerDownIssue(issue, $event)"
							@dblclick.stop="openIssueDetails(issue)"
						>
							<div class="severity issue_icon" v-if="issue.severity">
								<SeverityIcon :severity="issue.severity" :size="20" />
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
								<span class="field_value" :class="{limited_length: key == 'file_path' || key == 'names'}">{{ value }}</span>
							</template>

							<div class="issue_icon clear_button" @pointerdown.stop @click="clearIssue(issue)">
								<Trash :size="20" />
							</div>

							<p v-if="issue.type.description && group_by != 'issue'" class="description">{{ issue.type.description }}</p>
						</li>
					</ul>
				</li>
				<template v-if="groups.length == 0">
					No issues...
					<p class="no_issues_message" v-if="issues.length == 0">Drop a log file, or press Ctrl + V to paste a log</p>
				</template>
			</ul>
		</div>
		<IssueDetails ref="issue_dialog" v-if="selected_issue" :issue="selected_issue" />
	</div>
</template>


<script lang="ts">

import { Plus, Search, Trash, X, AlertTriangle, AlertCircle, MessageCircleWarning, ChevronRight, ChevronDown } from 'lucide-vue-next'
import IssueDetails from './components/IssueDetails.vue';
import { Issue, parseLog } from './scripts/parse_log'
import { IssueType, IssueTypes, TypeLabels, ValueLabels } from './scripts/issue_types';
import { nextTick } from 'vue';
import SeverityIcon from './components/SeverityIcon.vue';

const collator = new Intl.Collator('en');


type IssueGroup = {
	key: string
	name: string
	issues: Issue[],
	issue_type?: IssueType
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
		MessageCircleWarning,
		ChevronRight,
		ChevronDown,
		IssueDetails,
		SeverityIcon
	},
	data() {
		return {
			group_by: 'issue',
			search_term: '',
			issues: Issue.all,
			selected_group: null as null|string,
			selected_issue: null as null|Issue,
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
		pointerDownIssue(issue: Issue, event: PointerEvent) {
			this.selectIssue(issue);
			const up = (event2: PointerEvent) => {
				let distance = [
					Math.abs(event.clientX - event2.clientX),
					Math.abs(event.clientY - event2.clientY),
				];
				if (distance[0] < 4 && distance[1] < 4) {
					this.openIssueDetails(issue);
				}
				// @ts-ignore
				event.target?.removeEventListener('pointerup', up);
			}
			// @ts-ignore
			event.target?.addEventListener('pointerup', up);
		},
		selectIssue(issue: Issue) {
			this.selected_issue = issue;
		},
		openIssueDetails(issue: Issue) {
			this.selected_issue = issue;
			nextTick(() => {
				if (this.$refs.issue_dialog) this.$refs.issue_dialog.$el.showModal();
			})
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
							issue_type: issue.type,
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
							type: issue.asset_id ? issue.asset_type : '',
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
		const loadLog = (log: string, is_file: boolean = false) => {
			if (!log) {
				if (is_file) {
					alert('The file you uploaded is either emtpy or too large to be supported by the web browser')
				}
				return;
			}
			parseLog(log);
			this.update();
		}

		document.addEventListener('paste', (event) => {
			if (document.querySelector('input:focus, textarea:focus')) {
				return;
			}
			const pasted_text = event.clipboardData?.getData('text');
			if (pasted_text) {
				loadLog(pasted_text);
			}
		});
		
		// File Drop
		function dropHandler(ev: DragEvent) {
			console.log("File(s) dropped");
			ev.preventDefault();
			if (!ev.dataTransfer) return;

			if (ev.dataTransfer.items) {
				[...ev.dataTransfer.items].forEach((item, i) => {
					if (item.kind === "file") {
						const file = item.getAsFile();
						file?.text().then(text => {
							loadLog(text, true);
						})
					} else if (item.kind == "string" && item.type == 'text/plain') {
						item.getAsString((text: string) => {
							loadLog(text)
						})
					}
				});
			} else {
				[...ev.dataTransfer.files].forEach((file, i) => {
					file?.text().then(text => {
						loadLog(text, true);
					})
				});
			}
		}
		document.addEventListener('drop', dropHandler);
		document.addEventListener('dragover', function dragOverHandler(ev: DragEvent) {
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault();
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
.no_issues_message {
	text-align: center;
	margin-top: 30px;
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
.issue.selected {
	background-color: var(--color-hover);
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
.description {
	width: 100%;
    color: var(--color-subtle);
	margin: 0 8px;
}
.issue_group > .description {
	margin: 2px 40px;
}

@media only screen and (max-width: 800px) {
}

</style>
