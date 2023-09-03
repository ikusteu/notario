<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import NoteCard from "./NoteCard.svelte";

	const note = {
		id: "note-1",
		content:
			"High-frequency trading (HFT) has revolutionized the way financial markets operate, offering quicker trade executions and drastically reducing the time it takes for new information to be incorporated into prices. HFT, in many cases, has increased the availability of liquidity by narrowing bid-ask spreads and providing more depth in order books.",
		resourceName: "Menkveld 2011",
		resourceURL: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1967574"
	};

	export let Hst: Hst;
</script>

<Hst.Story title="Note Card" layout={{ type: "grid", width: 800 }}>
	<Hst.Variant title="Default">
		<div class="p-4">
			<NoteCard {...note} />
		</div>
	</Hst.Variant>
	<Hst.Variant title="Clickable">
		<div class="p-4">
			<NoteCard clickable {...note} />
		</div>
	</Hst.Variant>
	<Hst.Variant title="Outlined">
		<div class="p-4">
			<NoteCard outlined {...note} />
		</div>
	</Hst.Variant>
	<Hst.Variant title="Active">
		<div class="p-4">
			<NoteCard active {...note} />
		</div>
	</Hst.Variant>
	<Hst.Variant title="Disabled">
		<div class="p-4">
			<NoteCard disabled {...note} />
		</div>
	</Hst.Variant>
</Hst.Story>
