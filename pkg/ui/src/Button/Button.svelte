<script lang="ts">
	const colorLookup = {
		"light-gray": "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-200",
		gray: "bg-gray-400/50 text-gray-700",
		green: "bg-green-400 text-white hover:bg-green-500 active:bg-green-400",
		red: "bg-red-300 text-white hover:bg-red-400 active:bg-red-300"
	};

	export let color: keyof typeof colorLookup = "gray";

	const shapeLookup = {
		square: "",
		rounded: "rounded"
	};
	export let shape: keyof typeof shapeLookup = "rounded";
</script>

<button class="px-4 py-1.5 text-lg {colorLookup[color]} {shapeLookup[shape]} {$$props.class}" on:click><slot /></button>
