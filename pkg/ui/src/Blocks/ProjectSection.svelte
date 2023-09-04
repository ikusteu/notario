<script lang="ts">
	import ProjectRow from "./ProjectRow.svelte";

	export let name: string = "";

	export let disabled = false;
	export let highlighted = false;
</script>

<ProjectRow {disabled}>
	<div class="relative col-span-3 pr-6">
		<p class="mb-4 text-xl">{name}</p>
		<div class="flex items-center justify-between">
			<slot name="actions" />
		</div>
		{#if highlighted}
			<div class="absolute left-0 top-0 right-0 bottom-0 bg-gray-200/50" />
		{/if}
	</div>

	<div class="col-span-9 pl-6 {highlighted && 'rounded-lg ring-2 ring-green-300'}">
		<slot name="notes" />
	</div>
</ProjectRow>
