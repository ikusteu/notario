<script lang="ts">
	import { combineLatest, map, switchMap } from "rxjs";
	import { derived, get } from "svelte/store";
	import { page } from "$app/stores";

	import { Layout, NavButtonGroup, ProjectSubsection, NoteCard, SubsectionCard, copyMoveStore, TextEditable } from "@notario/ui";

	import type { PageData } from "./$types";

	import { readableFromStream } from "$lib/utils";

	import { createRoutes, projects, resources } from "$lib/data";

	export let data: PageData;

	const { db } = data;

	const copy = async (_: string, to: string, notes: string[]) => {
		const [, projectId, , sectionId, , subsectionId] = to.split("/");
		for (const note of notes) {
			await db.project(projectId).section(sectionId).subsection(subsectionId).addNote(note);
		}
	};

	$: projectId = $page.params.project;

	$: doc = readableFromStream(db?.project(projectId).stream().doc(), {
		_id: projectId,
		_rev: "",
		docType: "project",
		name: projectId,
		sections: []
	});

	$: nameStore = {
		subscribe: derived(doc, (d) => d.name).subscribe,
		set: (name: string) => name !== get(doc).name && db.project(projectId).setName(name)
	};

	$: sections = readableFromStream(
		combineLatest(
			$doc.sections.map((id) =>
				db
					.project(projectId)
					.section(id)
					.stream()
					.doc()
					.pipe(map(({ _id, ...section }) => ({ ...section, id: _id })))
			)
		).pipe(
			switchMap((sections) =>
				combineLatest(
					sections.map((section) =>
						combineLatest([
							db
								.project(projectId)
								.section(section.id)
								.stream()
								.doc()
								.pipe(map(({ _id: id, ...section }) => ({ ...section, id }))),
							...section.subsections.map((id) => db.project(projectId).section(section.id).subsection(id).stream().doc())
						]).pipe(
							map(([section, ...subsections]) => ({
								...section,
								subsections: subsections.map(({ _id: id, ...subsection }) => ({ ...subsection, id }))
							}))
						)
					)
				)
			)
		),
		[]
	);
	$: noteLookup = readableFromStream(db?.stream().noteMap, new Map());
	$: noteMap = derived(sections, (s) =>
		s.flatMap(({ subsections }) =>
			subsections.map(({ id, notes }) => [id, notes.map((note) => $noteLookup.get(note)?.id || "")] as [string, string[]])
		)
	);

	const {
		active: copyMoveActive,
		clipboard,
		src,
		dest,
		...copyMove
	} = copyMoveStore({
		copy
	});
	$: copyMove.updateElementMap($noteMap);
</script>

<Layout {projects} {resources}>
	<section slot="content-header" class="relative h-24 w-full flex-shrink-0 flex-grow-0 border-b">
		<TextEditable bind:value={$nameStore} class="absolute left-8 top-1/2 -translate-y-1/2 text-2xl" />
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<NavButtonGroup options={createRoutes(projectId)} current={$page.url.pathname} />
		</div>
	</section>

	<div class="overflow-auto px-8 {$copyMoveActive && 'bg-gray-200/50'}">
		{#each $sections as { id: sectionId, name, notes, subsections }, sectionIx}
			<ProjectSubsection disabled={$copyMoveActive && $src !== sectionId} {name}>
				<svelte:fragment slot="notes">
					{#each notes as n}
						{@const note = $noteLookup.get(n) || {}}
						<NoteCard action={copyMove.entry} {sectionId} {...note} />
					{/each}
				</svelte:fragment>
				<svelte:fragment slot="subsections">
					{#each subsections as { id: subsectionId, name, notes }, i}
						<SubsectionCard
							{sectionId}
							id={subsectionId}
							initCopyAction={copyMove.initCopyButton}
							active={$copyMoveActive && $dest === subsectionId}
							{name}
							prefix="{sectionIx + 1}.{i + 1}"
						>
							{#each notes as n}
								{@const note = $noteLookup.get(n) || {}}
								<NoteCard action={copyMove.entry} sectionId={subsectionId} {...note} />
							{/each}
							{#each [...$clipboard] as n}
								{@const note = $noteLookup.get(n) || {}}
								<NoteCard highlighted sectionId={subsectionId} {...note} />
							{/each}
						</SubsectionCard>
					{/each}
				</svelte:fragment>
			</ProjectSubsection>
		{/each}
	</div>

	<svelte:fragment slot="action-buttons">
		{#if $copyMoveActive}
			<button use:copyMove.resetButton class="button button-red rounded">Cancel</button>
			<button use:copyMove.commitButton class="button button-green rounded">Commit</button>
		{/if}
	</svelte:fragment>
</Layout>
