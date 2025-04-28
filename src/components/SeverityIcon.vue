<template>
    <AlertTriangle v-if="severity == 'warning'" style="color: var(--color-warning)" :size="size" />
    <AlertCircle v-else-if="severity == 'error'" style="color: var(--color-error)" :size="size" />
    <MessageCircleWarning v-else :size="size" />
</template>

<script lang="ts">
import { AlertTriangle, AlertCircle, MessageCircleWarning } from 'lucide-vue-next'

export default {
	components: {
		AlertTriangle,
		AlertCircle,
        MessageCircleWarning
	},
    props: {
        severity: String,
        size: Number
    },
}
</script>
