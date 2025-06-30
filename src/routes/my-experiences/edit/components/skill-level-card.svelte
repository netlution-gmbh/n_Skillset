<script lang="ts">
	import { Card } from 'flowbite-svelte';

	export let title: string;
	export let description: string;
</script>

<Card class="max-w-full">
	<div class="flex justify-between items-center mb-2">
		<h6 class="text-lg text-gray-900 font-semibold">{title}</h6>
	</div>
	<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
		{description}
	</p>
		<slot />
</Card>
