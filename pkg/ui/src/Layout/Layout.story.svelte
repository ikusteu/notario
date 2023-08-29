<script lang="ts">
	import type { Hst } from "@histoire/plugin-svelte";

	import Layout from "./Layout.svelte";
	import { NavButtonGroup } from "../NavButtonGroup";
	import { Button } from "../Button";
	import { ProjectSection } from "../Views";

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
		<section class="flex w-full justify-between px-8 pt-8 pb-16">
			<h1 class="text-2xl">Project</h1>
			<NavButtonGroup options={views} bind:current={view} />
			<Button color="light-gray">New Section</Button>
		</section>
		<div class="overflow-auto px-8">
			<ProjectSection title="Introduction" notes={[]} subsections={[]} />
			<ProjectSection title="Data" notes={[]} subsections={[]} />
		</div>
	</Layout>
</Hst.Story>
