<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import NavButtonGroup from "./NavButtonGroup.svelte";

	export let Hst: Hst;

	const options = ["Sections", "Subsections", "Text"];
</script>

<Hst.Story title="Nav Button Group">
	<NavButtonGroup on:change={(e) => console.log(e.detail)} {options} />
</Hst.Story>
