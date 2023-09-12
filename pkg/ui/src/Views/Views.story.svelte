<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import { SectionsView } from "../Views";

	export let Hst: Hst;
</script>

<Hst.Story title="Views">
	<Hst.Variant title="Sections">
		<SectionsView />
	</Hst.Variant>
</Hst.Story>
