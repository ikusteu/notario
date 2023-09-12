<script lang="ts">
	import type { EntryAction } from "$lib/actions/copyMoveNotes";
	import { createEventDispatcher } from "svelte";

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

	const dispatch = createEventDispatcher<{ activechange: boolean }>();

	const dispatchActiveChange = (active: boolean) => dispatch("activechange", active);
	const toggleSelected = () => clickable && dispatchActiveChange((active = !active));

	const interactive = (i: boolean) => (clickable = i);
	const select = (a: boolean) => (active = a);
	const disable = (d: boolean) => (disabled = d);
	const highlight = (h: boolean) => (highlighted = h);
</script>

<div
	on:click={toggleSelected}
	on:keydown
	class="my-4 rounded border p-4 pb-4 {clickable && 'select-none hover:cursor-pointer'} {active && 'bg-green-300/50'} {(active ||
		highlighted) &&
		'outline outline-2 outline-green-300'} {disabled && 'select-none bg-gray-300'}"
>
	<p class="mb-4 text-gray-700">{content}</p>
	<div
		use:action={{ id, sectionId, select, disable, highlight, interactive }}
		class="select-none text-right text-base italic text-gray-500"
	>
		{#if resourceURL && ![clickable, active, disabled, highlighted].some(Boolean)}
			<a class="inline-block cursor-pointer px-2 hover:bg-blue-200" href={resourceURL} target="_blank">
				<p>{resourceName}</p>
			</a>
		{:else}
			<p class="px-2">{resourceName}</p>
		{/if}
	</div>
</div>
