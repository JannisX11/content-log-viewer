<script setup>

</script>

<template>
	<div id="wrapper" >
		<header>
			<h1>Content Log Viewer</h1>
			<button @click="pasteLog()"></button>
		</header>
		<main>
			<div id="list_section">
				
			</div>
			<div id="details_section">
				
			</div>
		</main>
	</div>
</template>


<script>

import { Plus } from 'lucide-vue-next'


export default {
	components: {
		Plus
	},
	data() {
		return {
		}
	},
	methods: {
	},
	mounted() {
	}
}
</script>

<style scoped>


#wrapper {
	height: 100%;
	display: grid;
	grid-template-rows: 40px auto;
	grid-template-columns: 300px auto;
	grid-template-areas: 
		"header header"
		"sidebar editor";
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
main {
	grid-area: editor;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	overflow: hidden;
}
@media only screen and (max-width: 800px) {
}

</style>
