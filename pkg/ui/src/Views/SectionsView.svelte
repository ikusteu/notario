<script lang="ts">
	import { ProjectSection } from "../Blocks";
	import { NoteCard } from "../NoteCard";
	import { Button } from "../Button";
	import { NavButtonGroup } from "$lib/NavButtonGroup";
	import { Layout } from "$lib/Layout";

	import { moveCopyStore } from "../actions/copyMoveNotes";

	// #region temp
	import { notes } from "../data";

	const projects = ["Discertation", "Case Study: 1"].map((name) => ({
		name,
		href: "",
		current: false
	}));

	const resources = [
		"High frequency trading",
		"Does Algorythmic Trading Improve Liquidity",
		"Foucault (2023)",
		"High Frequency Trading and Price Discovery"
	].map((name) => ({
		name,
		href: "",
		current: false
	}));

	const sections = [
		{ id: "intro", name: "Intro", notes },
		{ id: "met", name: "Methodology", notes },
		{ id: "res", name: "Results", notes },
		{ id: "conc", name: "Conclusion", notes }
	];
	const noteMap = new Map([
		["intro", new Set(notes.map(({ id }) => id))],
		["met", new Set([""])],
		["res", new Set(notes.map(({ id }) => id))],
		["conc", new Set(notes.map(({ id }) => id))]
	]);

	// #endregion temp

	const views = ["Sections", "Subsections", "Text"];
	let view = "Sections";

	const copyFrom = "";
	const copyTo = "";

	const { active, ...moveCopy } = moveCopyStore({ noteMap });
</script>

<Layout sidebarOpen {projects} {resources}>
	<section slot="content-header" class="flex w-full justify-between border-b px-8 pt-8 pb-16">
		<h1 class="text-2xl">Project</h1>
		<NavButtonGroup options={views} bind:current={view} />
		<Button color="light-gray">New Section</Button>
	</section>

	<div class="overflow-auto px-8 {false && 'bg-gray-200/50'}">
		{#each sections as { id, name, notes }}
			{@const otherSections = sections.filter((s) => s.id !== id)}

			<ProjectSection {name}>
				<svelte:fragment slot="actions">
					{#if !$active}
						<div class="">
							<select
								class="flex h-10 cursor-pointer items-center justify-center rounded border px-4 focus:outline-none active:outline-none"
							>
								{#each otherSections as { id, name }}
									<option value={id}>{name}</option>
								{/each}
							</select>
						</div>
						<button
							use:moveCopy.initCopyButton={id}
							class="rounded bg-gray-200 px-4 py-1.5 text-lg text-gray-700 hover:bg-gray-300 active:bg-gray-200">Copy</button
						>
					{/if}
				</svelte:fragment>

				<svelte:fragment slot="notes">
					{#each notes as note}
						<NoteCard action={moveCopy.entry} sectionId={id} {...note} />
					{/each}
				</svelte:fragment>
			</ProjectSection>
		{/each}
	</div>

	<svelte:fragment slot="action-buttons">
		{#if $active}
			<button use:moveCopy.resetButton class="rounded bg-red-300 px-4 py-1.5 text-lg text-white hover:bg-red-400 active:bg-red-300"
				>Cancel</button
			>
			<button use:moveCopy.commitButton class="rounded bg-green-400 px-4 py-1.5 text-lg text-white hover:bg-green-500 active:bg-green-400"
				>Commit</button
			>
		{/if}
	</svelte:fragment>
</Layout>
