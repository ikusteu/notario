<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import { SubsectionCard } from "../SubsectionCard";
	import ProjectSubsection from "./ProjectSubsection.svelte";
	import { NoteCard } from "../NoteCard";

	import { notes, createSubsections } from "../data";

	const subsections = createSubsections("intro");

	const sectionIx = 0;
	const name = "Intro";

	export let Hst: Hst;

	let active = "";
	const activate = (id: string) => (active = id);
	const reset = () => (active = null);
	const toggleActive = (id: string) => () => active !== id ? activate(id) : reset();
</script>

<Hst.Story title="Project Subsection">
	<ProjectSubsection {name}>
		<svelte:fragment slot="notes">
			{#each notes as note}
				<NoteCard {...note} />
			{/each}
		</svelte:fragment>
		<svelte:fragment slot="subsections">
			{#each subsections as { id, name }, i}
				<SubsectionCard {id} active={active === id} on:click={toggleActive(id)} {name} prefix="{sectionIx + 1}.{i + 1}">
					{#each notes as note}
						<NoteCard {...note} />
					{/each}
				</SubsectionCard>
			{/each}
		</svelte:fragment>
	</ProjectSubsection>
</Hst.Story>
