<script>
	export let title = "";

	export let disabled = false;
</script>

<section class="relative bg-white py-4 px-6">
	<div class="h-8">
		{#if title}
			<h2 class="h-full text-xl">{title}</h2>
		{/if}
	</div>

	<div class="grid min-h-[200px] w-full grid-cols-12 grid-rows-1 items-stretch divide-x">
		<slot />
	</div>

	{#if disabled}
		<div class="absolute right-0 top-0 left-0 bottom-0 bg-gray-200/50" />
	{/if}
</section>
