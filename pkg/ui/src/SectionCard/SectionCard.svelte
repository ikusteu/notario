<script lang="ts">
	import { ArrowUp, ArrowDown } from "lucide-svelte";

	export let name = "";
</script>

<div class="flex items-center justify-between py-2">
	<p class="text-xl">{name}</p>
	<div>
		<button class="my-2 flex h-6 w-6 items-center justify-center rounded-full border text-gray-400">
			<ArrowUp />
		</button>
		<button class="my-2 flex h-6 w-6 items-center justify-center rounded-full border text-gray-400">
			<ArrowDown />
		</button>
	</div>
</div>
