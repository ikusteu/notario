<script lang="ts">
	import { ProjectSection } from "../Blocks";
	import { NoteCard } from "../NoteCard";
	import { Button } from "../Button";
	import { NavButtonGroup } from "$lib/NavButtonGroup";
	import { Layout } from "$lib/Layout";

	// #region temp
	import { notes } from "../data";

	const projects = ["Discertation", "Case Study: 1"].map((name) => ({
		name,
		href: "",
		current: false
	}));

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

	const sections = [
		{ id: "intro", name: "Intro", notes },
		{ id: "met", name: "Methodology", notes },
		{ id: "res", name: "Results", notes },
		{ id: "conc", name: "Conclusion", notes }
	];

	// #endregion temp

	let copyFrom = "";
	let copyTo = "";
	let notesToCopy = new Set<string>();
	let copying = false;

	const noteSelectLookup = new Map<string, string>();

	const select = (node: HTMLSelectElement, id: string) => {
		noteSelectLookup.set(id, node.value);

		const handleChange = (e: Event) => {
			const value = (e.target as HTMLSelectElement).value;
			noteSelectLookup.set(id, value);
		};

		node.addEventListener("change", handleChange);

		return {
			destroy() {
				node.removeEventListener("change", handleChange);
			}
		};
	};

	const initCopy = (sectionId: string) => () => {
		copyFrom = sectionId;
		copyTo = noteSelectLookup.get(sectionId)!;
		copying = true;
	};
	const resetCopy = () => {
		copyFrom = "";
		copyTo = "";
		copying = false;
		notesToCopy.clear();
	};

	const views = ["Sections", "Subsections", "Text"];
	let view = "Sections";
</script>

<Layout sidebarOpen {projects} {resources}>
	<section slot="content-header" class="flex w-full justify-between border-b px-8 pt-8 pb-16">
		<h1 class="text-2xl">Project</h1>
		<NavButtonGroup options={views} bind:current={view} />
		<Button color="light-gray">New Section</Button>
	</section>

	<div class="overflow-auto px-8 {copying && 'bg-gray-200/50'}">
		{#each sections as { id, name, notes }}
			{@const otherSections = sections.filter((s) => s.id !== id)}

			<ProjectSection {name} disabled={copying && ![copyFrom, copyTo].includes(id)}>
				<svelte:fragment slot="actions">
					{#if !copying}
						<div class="">
							<select
								use:select={id}
								class="flex h-10 cursor-pointer items-center justify-center rounded border px-4 focus:outline-none active:outline-none"
							>
								{#each otherSections as { id, name }}
									<option value={id}>{name}</option>
								{/each}
							</select>
						</div>
						<Button on:click={initCopy(id)} color="light-gray">Copy</Button>
					{/if}
				</svelte:fragment>

				<svelte:fragment slot="notes">
					{#each notes as note}
						<NoteCard active={copying && notesToCopy.has(note.id)} clickable={copying} {...note} />
					{/each}
				</svelte:fragment>
			</ProjectSection>
		{/each}
	</div>

	<svelte:fragment slot="action-buttons">
		{#if copying}
			<Button on:click={resetCopy} color="red">Cancel</Button>
			<Button on:click={() => (copying = true)} color="green">Commit</Button>
		{/if}
	</svelte:fragment>
</Layout>
