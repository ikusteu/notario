<script lang="ts">
	const colorLookup = {
		"light-gray": "bg-gray-200 text-gray-700",
		gray: "bg-gray-400/50 text-gray-700"
	};

	export let color: keyof typeof colorLookup = "gray";

	const shapeLookup = {
		square: "",
		rounded: "rounded"
	};
	export let shape: keyof typeof shapeLookup = "rounded";
</script>

<button class="px-4 py-1.5 text-lg {colorLookup[color]} {shapeLookup[shape]} {$$props.class}" on:click><slot /></button>
