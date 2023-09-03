<script lang="ts">
	import ProjectRow from "./ProjectRow.svelte";

	export let name: string = "";

	export let disabled = false;
</script>

<ProjectRow {disabled}>
	<div class="col-span-3 pr-6">
		<p class="mb-4 text-xl">{name}</p>
		<div class="flex items-center justify-between">
			<slot name="actions" />
		</div>
	</div>

	<div class="col-span-9 pl-6">
		<slot name="notes" />
	</div>
</ProjectRow>
