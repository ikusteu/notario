<script lang="ts">
	import { Menu } from "lucide-svelte";
	import { createEventDispatcher } from "svelte";

	import { NewEntitySideNavButton, SidebarItem } from "../Sidebar";

	export let sidebarOpen = false;
	export let currentRoute = "";

	interface NavItem {
		name: string;
		href: string;
		current: boolean;
	}

	export let resources: NavItem[] = [];
	export let projects: NavItem[] = [];

	const dispatch = createEventDispatcher<{ createproject: "" }>();
	const createProject = () => dispatch("createproject");

	const toggleOpenSidebar = () => (sidebarOpen = !sidebarOpen);
</script>

<div class="flex h-screen flex-col overflow-hidden">
	<div class="basis-[5%]">
		<header class="flex h-[4.5rem] w-full items-center justify-start border-b border-sky-900 bg-gray-900 px-4 py-4">
			<button
				class="flex h-10 w-10 items-center justify-center rounded-sm text-white {sidebarOpen && 'bg-gray-600'}"
				on:click={toggleOpenSidebar}
			>
				<Menu />
			</button>
		</header>
	</div>

	<main class="flex basis-[95%] items-stretch divide-x divide-gray-300 overflow-hidden">
		{#if sidebarOpen}
			<section
				id="sidebar-section"
				class="h-full shrink-0 basis-32 overflow-y-auto overflow-x-hidden whitespace-nowrap bg-gray-50 sm:basis-56"
			>
				<SidebarItem name="Notes" href="/notes" current={currentRoute.includes("notes")} />
				<div class="p-3 text-sm font-bold">Resources</div>
				{#each resources as resource}
					<SidebarItem name={resource.name} href={resource.href} nested current={resource.current} />
				{/each}
				<div class="p-3 text-sm font-bold">Projects</div>
				{#each projects as project}
					<SidebarItem name={project.name} nested href={project.href} current={project.current} />
				{/each}
				<div class="pl-7">
					<NewEntitySideNavButton label="New Project" on:click={createProject} />
				</div>
			</section>
		{/if}

		<div class="flex h-full w-full flex-col overflow-hidden">
			<slot name="content-header" />

			<section class="w-full overflow-auto border">
				<slot />
			</section>

			{#if $$slots["action-buttons"]}
				<section class="flex w-full items-center justify-end gap-x-4 border bg-white px-12 py-4">
					<slot name="action-buttons" />
				</section>
			{/if}
		</div>
	</main>
</div>
