<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let content = "";
	export let resourceName = "";
	export let resourceURL = "";

	export let clickable = false;
	export let active = false;
	export let outlined = false;
	export let disabled = false;

	const dispatch = createEventDispatcher<{ activechange: boolean }>();

	const dispatchActiveChange = (active: boolean) => dispatch("activechange", active);
	const toggleSelected = () => clickable && dispatchActiveChange((active = !active));
</script>

<div
	on:click={toggleSelected}
	on:keydown
	class="my-4 rounded border p-4 pb-4 {clickable && 'select-none hover:cursor-pointer'} {active && 'bg-green-300/50'} {(active ||
		outlined) &&
		'outline outline-2 outline-green-300'} {disabled && 'select-none bg-gray-300'}"
>
	<p class="mb-4 text-gray-700">{content}</p>
	<div class="select-none text-right text-base italic text-gray-500">
		{#if resourceURL && !active && !disabled}
			<a class="inline-block cursor-pointer px-2 hover:bg-blue-200" href={resourceURL} target="_blank">
				<p>{resourceName}</p>
			</a>
		{:else}
			<p class="px-2">{resourceName}</p>
		{/if}
	</div>
</div>
