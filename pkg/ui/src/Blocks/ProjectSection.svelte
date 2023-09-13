<script lang="ts">
	import ProjectRow from "./ProjectRow.svelte";

	export let name: string = "";

	export let disabled = false;
	export let highlighted = false;
</script>

<ProjectRow class={!disabled && !highlighted && "bg-white"}>
	<div class="relative col-span-3 pr-6">
		<p class="mb-4 text-xl">{name}</p>
		<div class="flex items-center justify-between">
			<slot name="actions" />
		</div>
		{#if disabled || highlighted}
			<div class="absolute left-0 top-0 right-0 bottom-0 bg-opacity-0" />
		{/if}
	</div>

	<div class="relative col-span-9 px-6 {highlighted && 'rounded-lg bg-white ring-4 ring-green-300'}">
		<div>
			<slot name="notes" />
		</div>
		{#if disabled}
			<div class="absolute left-0 top-0 right-0 bottom-0 bg-opacity-0" />
		{/if}
	</div>
</ProjectRow>
