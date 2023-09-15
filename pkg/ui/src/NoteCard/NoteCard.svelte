<script lang="ts">
	import type { EntryAction } from "$lib/actions/copyMoveNotes";

	export let sectionId = "";

	export let id = "";
	export let content = "";
	export let resourceName = "";
	export let resourceURL = "";

	export let clickable = false;
	export let active = false;
	export let highlighted = false;
	export let disabled = false;

	export let action: EntryAction = () => ({ destroy: () => {} });

	const interactive = (i: boolean) => (clickable = i);
	const select = (a: boolean) => (active = a);
	const disable = (d: boolean) => (disabled = d);
	const highlight = (h: boolean) => (highlighted = h);
</script>

<div
	use:action={{ id, sectionId, select, disable, highlight, interactive }}
	class="group relative my-4 overflow-hidden rounded border p-4 pb-4 {clickable && 'select-none hover:cursor-pointer'} {active &&
		'bg-green-300/50'} {(active || highlighted) && 'outline outline-2 outline-green-300'} {disabled && 'select-none bg-gray-300'}"
>
	{#if $$slots.actionButtons}
		<div class="absolute top-2 right-2 hidden group-hover:block">
			<slot name="actionButtons" />
		</div>
	{/if}

	<p class="mb-4 text-gray-700">{content}</p>
	<div class="select-none text-right text-base italic text-gray-500">
		{#if resourceURL && ![clickable, active, disabled, highlighted].some(Boolean)}
			<a class="inline-block cursor-pointer px-2 hover:bg-blue-200" href={resourceURL} target="_blank">
				<p>{resourceName}</p>
			</a>
		{:else}
			<p class="px-2">{resourceName}</p>
		{/if}
	</div>
</div>
