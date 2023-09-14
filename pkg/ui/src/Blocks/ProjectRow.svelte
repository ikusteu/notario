<script>
	export let title = "";
</script>

<section class="relative py-4 px-6 {$$restProps.class}">
	<div class="h-10">
		{#if title}
			<h2 class="h-full text-2xl">{title}</h2>
		{/if}
	</div>

	<div class="grid min-h-[200px] w-full grid-cols-12 grid-rows-1 items-stretch divide-x">
		<slot />
	</div>
</section>
