<script lang="ts">
	import { ArrowRight } from "lucide-svelte";
	import { createEventDispatcher, tick } from "svelte";

	import type { InitAction } from "../actions/copyMoveNotes";
	import { writable } from "svelte/store";

	export let sectionId = "";

	export let prefix = "";

	export let id = "";
	export let name = "";

	export let active = false;

	export let initCopyAction: InitAction = () => ({
		destroy: () => {}
	});

	const dispatch = createEventDispatcher<{ moveup: void; movedown: void; remove: void; rename: string }>();

	// Edit name
	let nameInput: HTMLInputElement = null;
	const renaming = writable(false);

	$: renaming && tick().then(() => nameInput && (nameInput.focus(), nameInput.setAttribute("value", name)));
	$: active && tick().then(() => ($renaming = false));

	const cancelRename = () => ($renaming = false);
	const confirmRename = () => {
		const value = nameInput?.value.trim();
		if (value) {
			dispatch("rename", value);
			name = value;
			nameInput?.blur();
		}
	};
	const handleInputKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case "Enter":
				return confirmRename();
			case "Escape":
				return cancelRename();
		}
	};
</script>

<div class="w-full px-6 {active && 'bg-white'}">
	<div
		on:click
		use:initCopyAction={{ from: sectionId, to: id }}
		on:keydown
		class="group relative my-4 w-full cursor-pointer select-none rounded"
	>
		<button
			class="absolute top-1/2 left-0 h-8 w-8 -translate-x-full -translate-y-1/2 items-center justify-center border border-gray-200 text-white {active
				? 'flex bg-green-300'
				: 'hidden bg-green-200 group-hover:flex'}"><ArrowRight /></button
		>
		<div class="flex min-h-[44px] w-full gap-2 px-4 py-2 text-lg tracking-normal">
			<span>{prefix}</span>
			{#if $renaming}
				<input class="h-7 w-full" bind:this={nameInput} type="text" on:keydown={handleInputKeydown} on:blur={cancelRename} />
			{:else}
				<span>
					{name}
				</span>
			{/if}
		</div>
		{#if !active && !$renaming && $$slots.actionButtons}
			<div class="absolute top-1/2 right-0 hidden -translate-y-1/2 group-hover:block">
				<slot {renaming} name="actionButtons" />
			</div>
		{/if}
	</div>

	{#if $$slots.default && active}
		<div class="mt-2 h-px w-full bg-gray-200" />
		<slot />
	{/if}

	<div class="mb-8 h-0.5 w-full bg-gray-400" />
</div>
