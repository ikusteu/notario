<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import SubsectionCard from "./SubsectionCard.svelte";
	import { NoteCard } from "../NoteCard";
	import { ActionButtons } from "../ActionButtons";

	import { notes } from "../data";

	export let Hst: Hst;

	const name = "Subsection 1";

	let active = false;
	const toggleActive = () => (active = !active);
</script>

<Hst.Story title="Subsection Card" layout={{ type: "grid", width: 800 }}>
	<Hst.Variant title="Default">
		<div class="px-6">
			<SubsectionCard on:click={toggleActive} {name} {active} prefix="1.1">
				<svelte:fragment slot="actionButtons" let:renaming>
					<ActionButtons on:edit={() => renaming.set(true)} actions={["edit", "moveup", "movedown", "remove"]} />
				</svelte:fragment>

				{#each notes.slice(0, 2) as note}
					<NoteCard disabled {...note} />
				{/each}
				{#each notes.slice(2) as note}
					<NoteCard highlighted {...note} />
				{/each}
			</SubsectionCard>
		</div>
	</Hst.Variant>
</Hst.Story>
