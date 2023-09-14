<script lang="ts">
	import { onMount } from "svelte";

	import "../main.css";

	import type { LayoutData } from "./$types";

	export let data: LayoutData;

	const { db } = data;

	onMount(() => {
		window["_db"] = db;
	});
</script>

<slot />
