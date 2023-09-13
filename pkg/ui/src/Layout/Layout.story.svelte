<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import Layout from "./Layout.svelte";
	import { NavButtonGroup } from "../NavButtonGroup";

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

	const views = ["Sections", "Subsections", "Text"];
	let view = "Sections";
</script>

<Hst.Story title="Layout">
	<Layout sidebarOpen {projects} {resources}>
		<section slot="content-header" class="flex w-full justify-between border-b px-8 pt-8 pb-16">
			<h1 class="text-2xl">Project</h1>
			<NavButtonGroup options={views} bind:current={view} />
			<button class="button button-light-gray">New Section</button>
		</section>
	</Layout>
</Hst.Story>
