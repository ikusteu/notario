<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import { Button } from "../Button";

	export let options: string[] = [];
	export let current: string = options[0] || "";

	const setCurrent = (option: string) => (current = option);

	const dispatch = createEventDispatcher<{ change: string }>();
	$: dispatch("change", current);
</script>

<nav class="inline-block overflow-hidden rounded border border-gray-700">
	<ul class="flex list-none flex-row divide-x divide-gray-700">
		{#each options as option}
			<li>
				<Button color={option === current ? "light-gray" : "gray"} shape="square" border={false} on:click={() => setCurrent(option)}
					>{option}</Button
				>
			</li>
		{/each}
	</ul>
</nav>
