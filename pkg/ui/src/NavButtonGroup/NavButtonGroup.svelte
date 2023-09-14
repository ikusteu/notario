<script lang="ts">
	export let options: { label: string; href: string }[] = [];
	export let current = "";

	const trimPath = (path: string) => path.trim().replace(/^\//, "").replace(/\/$/, "");
	const isEqualPath = (a: string, b: string) => trimPath(a) === trimPath(b);
</script>

<nav class="inline-block overflow-hidden rounded border border-gray-700">
	<ul class="flex list-none flex-row divide-x divide-gray-700">
		{#each options as { label, href }}
			<li>
				<a {href}>
					<button class="button {isEqualPath(current, href) ? 'button-light-gray' : 'button-gray'}">{label}</button>
				</a>
			</li>
		{/each}
	</ul>
</nav>
