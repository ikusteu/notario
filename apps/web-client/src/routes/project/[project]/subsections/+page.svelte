<script lang="ts">
	import { page } from "$app/stores";

	import { Layout, NavButtonGroup, ProjectSubsection, NoteCard, SubsectionCard, copyMoveStore } from "@notario/ui";

	import { projects, resources, routes, sections, noteLookup } from "$lib/data";

	const noteMap = new Map(sections.flatMap(({ subsections }) => subsections.map(({ id, notes }) => [id, new Set(notes)])));

	const { active: addNotesActive, clipboard, src, dest, ...copyMove } = copyMoveStore({ noteMap });
</script>

<Layout {projects} {resources}>
	<section slot="content-header" class="relative h-96 w-full border-b">
		<h1 class="absolute left-8 top-1/2 -translate-y-1/2 text-2xl">Project</h1>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<NavButtonGroup options={routes} current={$page.url.pathname} />
		</div>
	</section>

	<div class="overflow-auto px-8 {$addNotesActive && 'bg-gray-200/50'}">
		{#each sections as { id: sectionId, name, notes, subsections }, sectionIx}
			<ProjectSubsection disabled={$addNotesActive && $src !== sectionId} {name}>
				<svelte:fragment slot="notes">
					{#each notes as note}
						<NoteCard action={copyMove.entry} {sectionId} {...note} />
					{/each}
				</svelte:fragment>
				<svelte:fragment slot="subsections">
					{#each subsections as { id: subsectionId, name, notes }, i}
						<SubsectionCard
							{sectionId}
							id={subsectionId}
							initCopyAction={copyMove.initCopyButton}
							active={$addNotesActive && $dest === subsectionId}
							{name}
							prefix="{sectionIx + 1}.{i + 1}"
						>
							{#each notes as note}
								<NoteCard action={copyMove.entry} sectionId={subsectionId} {...noteLookup.get(note)} />
							{/each}
							{#each [...$clipboard] as note}
								<NoteCard highlighted sectionId={subsectionId} {...noteLookup.get(note)} />
							{/each}
						</SubsectionCard>
					{/each}
				</svelte:fragment>
			</ProjectSubsection>
		{/each}
	</div>

	<svelte:fragment slot="action-buttons">
		{#if $addNotesActive}
			<button use:copyMove.resetButton class="button button-red rounded">Cancel</button>
			<button use:copyMove.commitButton class="button button-green rounded">Commit</button>
		{/if}
	</svelte:fragment>
</Layout>
