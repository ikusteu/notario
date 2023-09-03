<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import ProjectSection from "./ProjectSection.svelte";
	import { NoteCard } from "../NoteCard";

	import { notes } from "../data";

	const name = "Intro";

	export let Hst: Hst;
</script>

<Hst.Story title="ProjectSection">
	<Hst.Variant title="Default">
		<ProjectSection {name}>
			<svelte:fragment slot="notes">
				{#each notes as note}
					<NoteCard {...note} />
				{/each}
			</svelte:fragment>
		</ProjectSection>
	</Hst.Variant>
	<Hst.Variant title="Disabled">
		<ProjectSection disabled {name}>
			<svelte:fragment slot="notes">
				{#each notes as note}
					<NoteCard {...note} />
				{/each}
			</svelte:fragment>
		</ProjectSection>
	</Hst.Variant>
</Hst.Story>
