<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let name: string = "";
	export let notes: string[] = [];
	export let subsections: { name: string; notes: string }[] = [];

	const dispatch = createEventDispatcher<{ titlechange: string; copynote: { noteId: string; subsectionId: string } }>();

	let destSubsection = "";

	const changeTitle = (e: Event) => dispatch("titlechange", (e.target as HTMLInputElement).value);
	const copyNote = (noteId: string) => () => dispatch("copynote", { noteId, subsectionId: destSubsection });
</script>

<section class="grid min-h-[200px] w-full grid-cols-12 grid-rows-1 items-stretch divide-x divide-gray-500">
	<div class="col-span-3 pr-4 pb-8">
		<h2 class="text-xl">{name}</h2>
	</div>
	<div class="col-span-5 px-4 pb-8">
		{#each notes as note}
			<p class="pb-4">{note}</p>
		{/each}
	</div>
	<div class="col-span-4 pl-4 pb-8">
		{#if destSubsection}
			<p class="pb-4">{destSubsection}</p>
		{/if}
		{#each subsections as subsection}
			<p class="pb-4">{subsection}</p>
		{/each}
	</div>
</section>
