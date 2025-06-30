<script lang="ts">
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import { Button } from 'flowbite-svelte';

	export let title: string;
	export let description: string;
	export let backUrl: string | undefined = undefined;
</script>

<div class="flex justify-between items-center mb-8">
	<div class="flex items-center gap-4">
	{#if backUrl}
		<Button pill={true} href={backUrl} color="light" class="max-w-5 me-5" size="xl">
				<ArrowLeftOutline />
			</Button>
	{/if}
	</div>
	<div class="min-w-fit">
		<h1 class="text-2xl font-bold ">{title}</h1>
		<slot name="subheader" />
		<p class="text-gray-600 mt-2">{description}</p>
	</div>
	<div class="flex gap-2 w-full justify-end">
		<slot name="actions" />
	</div>
</div>
