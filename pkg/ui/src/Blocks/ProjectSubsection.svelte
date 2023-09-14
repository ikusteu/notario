<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import ProjectRow from "./ProjectRow.svelte";

	export let name: string = "";

	export let disabled = false;

	const dispatch = createEventDispatcher<{ add: void }>();
	const addNew = () => dispatch("add");
</script>

<ProjectRow title={name} class={!disabled && "bg-white"}>
	<div class="relative col-span-6 px-6">
		<div>
			<slot name="notes" />
		</div>
		{#if disabled}
			<div class="absolute left-0 top-0 right-0 bottom-0 bg-opacity-0" />
		{/if}
	</div>

	<div class="relative col-span-6">
		<ul class="w-full">
			<slot name="subsections" />
		</ul>
		<button
			on:click={addNew}
			class="mx-[10%] my-8 flex w-[80%] items-center justify-center rounded-lg py-2 text-center text-lg text-gray-500 outline outline-gray-300 hover:outline-2 active:bg-gray-100"
			>Add new</button
		>
	</div>
</ProjectRow>
