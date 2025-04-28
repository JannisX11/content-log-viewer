<script setup>

</script>

<template>
	<dialog id="issue_view" @click="click($event)">
        <h2>
            <template v-if="issue && issue.severity">
                <AlertTriangle v-if="issue.severity == 'warning'" style="color: var(--color-warning)" :size="24" />
                <AlertCircle v-else style="color: var(--color-error)" :size="26" />
            </template>
            {{ issue?.type.name }}
        </h2>

        <main v-if="issue">

            <h3>Details</h3>

            <p v-if="issue.type.description">{{ issue.type.description }}</p>
            <div class="issue_detain_line" v-if="issue.text">
                <label class="field_label">Message</label>
                <span class="field_value">{{ issue.text }}</span>
            </div>
            <div class="issue_detain_line" v-if="issue.asset_id">
                <label class="field_label">{{ type_labels[issue.asset_type??''] ?? 'ID' }}</label>
                <span class="field_value">{{ issue.asset_id }}</span>
            </div>
            <div class="issue_detain_line" v-if="issue.resource_id">
                <label class="field_label">{{ type_labels[issue.resource_type??''] ?? 'ID' }}</label>
                <span class="field_value">{{ issue.resource_id }}</span>
            </div>
            <div class="issue_detain_line" v-for="(value, key) in issue.values">
                <label class="field_label">{{ value_labels[key] || key }}</label>
                <span class="field_value" :class="{limited_length: key == 'file_path'}">{{ value }}</span>
            </div>

            <h3 v-if="issue_info.length">Info</h3>
            <div v-for="info in issue_info">
                {{ info }}
            </div>

            <h3>Error Message</h3>
            <div class="field_value">{{ issue.original_message }}</div>
        </main>

        <button @click="$el.close()">Close</button>
    </dialog>
</template>


<script lang="ts">

import { Plus, Search, Trash, X, AlertTriangle, AlertCircle, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { TypeLabels, ValueLabels } from '../scripts/issue_types';
import { Issue } from '../scripts/parse_log';

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
    props: {
        issue: Issue
    },
	data() {
		return {
			type_labels: TypeLabels,
			value_labels: ValueLabels,
		}
	},
	methods: {
        click(event: MouseEvent) {
            let rect = (event.target as HTMLElement).getBoundingClientRect();
            let in_dialog = (event.clientX > rect.x && event.clientX < rect.right && event.clientY > rect.y && event.clientY < rect.bottom);
            if (!in_dialog) this.$el.close();
            console.log(event)
        }
	},
    computed: {
        issue_info(): string[] {
            let issue: Issue = this.issue;
            let infos: string[] = [];
            if (!issue?.type?.info) return infos;

            for (let line of issue.type.info) {
                if (typeof line == 'object') {
                    let condition = line.if(issue);
                    if (condition) infos.push(line.text);
                } else {
                    infos.push(line);
                }
            }
            return infos;
        }
    }
}
</script>

<style scoped>
#issue_view {
    width: 800px;
    min-height: 200px;
}
#issue_view:open {
    display: flex;
    flex-direction: column;
}
h2 svg {
    vertical-align: text-top;
    margin-top: 2px;
    margin-right: 3px;
}
h2 {
    margin-bottom: 6px;
}
main {
    flex-grow: 1;
    overflow-y: auto;
    padding-bottom: 20px;
}
h3 {
    margin-top: 14px;
}

.issue_detain_line {
    padding: 4px 0;
    display: flex;
}
.field_label {
	padding: 0 4px;
    margin-right: 4px;
    min-width: min(140px, 40%);
    font-weight: 500;
}
.field_label:after {
	content: ":";
}
.field_value {
    overflow-wrap: break-word;
    max-width: 100%;
    font-family: Consolas, monospace;
    background-color: var(--color-editor);
    padding: 1px 7px;
    border-radius: 7px;
    overflow-wrap: break-word;
    overflow: hidden;
}

</style>

<style>
::backdrop {
  background-color: #000;
  opacity: 0.2;
}
</style>
