<script lang="ts">
	import { Layout, NavButtonGroup, ProjectSection, NoteCard } from "@notario/ui";

	import { projects, resources, views, sections } from "./data";

	// #region temp-copy
	let copyFrom = "";
	let copyTo = "";

	$: copyToNotes = (sections.find((s) => s.id === copyTo)?.notes ?? []).map(({ id }) => id);

	let notesToCopy = new Set<string>();
	let copying = false;

	const noteSelectLookup = new Map<string, string>();

	const select = (node: HTMLSelectElement, id: string) => {
		noteSelectLookup.set(id, node.value);

		const handleChange = (e: Event) => {
			const value = (e.target as HTMLSelectElement).value;
			noteSelectLookup.set(id, value);
		};

		node.addEventListener("change", handleChange);

		return {
			destroy() {
				node.removeEventListener("change", handleChange);
			}
		};
	};

	const initCopy = (sectionId: string) => () => {
		copyFrom = sectionId;
		copyTo = noteSelectLookup.get(sectionId)!;
		copying = true;
	};
	const resetCopy = () => {
		copyFrom = "";
		copyTo = "";
		copying = false;
		notesToCopy.clear();
	};
	// #endregion temp-copy
</script>

<Layout {projects} {resources}>
	<section slot="content-header" class="flex w-full justify-between border-b px-8 pt-8 pb-16">
		<h1 class="text-2xl">Project</h1>
		<NavButtonGroup options={views} current="Sections" />
		<button color="light-gray">New Section</button>
	</section>

	<div class="overflow-auto px-8 {copying && 'bg-gray-200/50'}">
		{#each sections as { id, name, notes }}
			{@const otherSections = sections.filter((s) => s.id !== id)}

			<ProjectSection {name} disabled={copying && ![copyFrom, copyTo].includes(id)} highlighted={copying && copyTo === id}>
				<svelte:fragment slot="actions">
					{#if !copying}
						<div class="">
							<select
								use:select={id}
								class="flex h-10 cursor-pointer items-center justify-center rounded border px-4 focus:outline-none active:outline-none"
							>
								{#each otherSections as { id, name }}
									<option value={id}>{name}</option>
								{/each}
							</select>
						</div>
						<button class="button button-light-gray rounded" on:click={initCopy(id)}>Copy</button>
					{/if}
				</svelte:fragment>

				<svelte:fragment slot="notes">
					{#each notes as note}
						<NoteCard
							active={copying && notesToCopy.has(note.id)}
							clickable={copying}
							disabled={copying && copyToNotes.includes(note.id)}
							{...note}
						/>
					{/each}
				</svelte:fragment>
			</ProjectSection>
		{/each}
	</div>

	<svelte:fragment slot="action-buttons">
		{#if copying}
			<button class="button button-red rounded" on:click={resetCopy}>Cancel</button>
			<button class="button button-greeen rounded" on:click={() => (copying = true)}>Commit</button>
		{/if}
	</svelte:fragment>
</Layout>
