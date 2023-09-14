<script lang="ts">
	import { getDB } from "$lib/db";

	import { loadNotes, loadProject } from "./data";

	const loadTestData = () => Promise.all([loadProject(getDB()), loadNotes(getDB())]);
</script>

<button on:click={loadTestData} class="button button-gray"> Load test data </button>
