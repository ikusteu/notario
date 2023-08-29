<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import Layout from "./Layout.svelte";

	export let Hst: Hst;

	const resources = [
		"High frequency trading",
		"Does Algorythmic Trading Improve Liquidity",
		"Foucault (2023)",
		"High Frequency Trading and Price Discovery"
	].map((name) => ({
		name,
		href: "",
		current: false
	}));

	const projects = ["Discertation", "Case Study: 1"].map((name) => ({
		name,
		href: "",
		current: false
	}));
</script>

<Hst.Story title="Layout">
	<Layout sidebarOpen {projects} {resources} />
</Hst.Story>
