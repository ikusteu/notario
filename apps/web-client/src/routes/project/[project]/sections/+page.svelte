<script lang="ts">
	import { Layout, NavButtonGroup, ProjectSection, NoteCard, copyMoveStore } from "@notario/ui";

	import { projects, resources, views, sections, notes } from "./data";

	const noteMap = new Map([
		["intro", new Set(notes.map(({ id }) => id))],
		["met", new Set(notes.slice(0, 2).map(({ id }) => id))],
		["res", new Set(notes.map(({ id }) => id))],
		["conc", new Set(notes.map(({ id }) => id))]
	]);

	const { active: copyMoveActive, src, dest, ...copyMove } = copyMoveStore({ noteMap });
</script>

<Layout {projects} {resources}>
	<section slot="content-header" class="flex w-full justify-between border-b px-8 pt-8 pb-16">
		<h1 class="text-2xl">Project</h1>
		<NavButtonGroup options={views} current="Sections" />
		<button class="button button-light-gray">New Section</button>
	</section>

	<div class="overflow-auto px-8 {$copyMoveActive && 'bg-gray-200/50'}">
		{#each sections as { id: sectionId, name, notes }}
			{@const otherSections = sections.filter((s) => s.id !== sectionId)}

			<ProjectSection
				{name}
				disabled={$copyMoveActive && ![$src, $dest].includes(sectionId)}
				highlighted={$copyMoveActive && $dest === sectionId}
			>
				<svelte:fragment slot="actions">
					{#if !$copyMoveActive}
						<div class="">
							<select
								use:copyMove.destinationPicker={sectionId}
								class="flex h-10 cursor-pointer items-center justify-center rounded border px-4 focus:outline-none active:outline-none"
							>
								{#each otherSections as { id, name }}
									<option value={id}>{name}</option>
								{/each}
							</select>
						</div>
						<button use:copyMove.initCopyButton={sectionId} class="button button-light-gray rounded">Copy</button>
					{/if}
				</svelte:fragment>

				<svelte:fragment slot="notes">
					{#each notes as note}
						<NoteCard action={copyMove.entry} {sectionId} {...note} />
					{/each}
				</svelte:fragment>
			</ProjectSection>
		{/each}
	</div>

	<svelte:fragment slot="action-buttons">
		{#if $copyMoveActive}
			<button use:copyMove.resetButton class="button button-red rounded">Cancel</button>
			<button use:copyMove.commitButton class="button button-green rounded">Commit</button>
		{/if}
	</svelte:fragment>
</Layout>
