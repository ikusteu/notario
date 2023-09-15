<script lang="ts">
	import { Pencil, ArrowUp, ArrowDown, Trash } from "lucide-svelte";

	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher<{
		edit: void;
		moveup: void;
		movedown: void;
		remove: void;
	}>();

	const buttonLookup = {
		edit: { Icon: Pencil, handler: () => dispatch("edit") },
		moveup: { Icon: ArrowUp, handler: () => dispatch("moveup") },
		movedown: { Icon: ArrowDown, handler: () => dispatch("movedown") },
		remove: { Icon: Trash, handler: () => dispatch("remove") }
	};

	export let actions: Array<keyof typeof buttonLookup> = [];
</script>

<div class="flex items-center justify-start gap-x-2 rounded-[32px] bg-white py-1 px-2 shadow-[0px_0px_12px_18px_#ffffff]">
	{#each actions as action}
		{@const { Icon, handler } = buttonLookup[action]}
		<button
			on:click|stopPropagation={handler}
			on:keydown
			class="flex h-8 w-8 items-center justify-center rounded-full p-1 text-gray-500 hover:bg-gray-100"><Icon /></button
		>
	{/each}
</div>
