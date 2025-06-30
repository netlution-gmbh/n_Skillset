<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Card } from 'flowbite-svelte';
	import { fade } from 'svelte/transition';
	import { CurrentNews } from '$lib/data/news';
	import { NewspaperSolid } from 'flowbite-svelte-icons';

	let currentIndex = 0;
	let interval: ReturnType<typeof setInterval>;

	// Set up auto-sliding
	onMount(() => {
		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % CurrentNews.length;
		}, 5000);
	});

	// Clean up interval when component is destroyed
	onDestroy(() => {
		clearInterval(interval);
	});

</script>

<div>
	<div>
		{#key currentIndex}
			<div in:fade={{ duration: 300 }}>
				<Card padding="xl" color="blue" class="relative">
					<div
						class="absolute bottom-[-12px] left-2 w-16 h-16 text-gray-200 dark:text-gray-700 opacity-30 transform rotate-12">
						<NewspaperSolid class="w-12 h-12 text-blue-700" />
					</div>
					<h5 class="mb-1 text-lg font-bold tracking-tight  text-blue-950 ">
						{CurrentNews[currentIndex].title}
					</h5>
					<p class="font-normal text-md text-gray-700 dark:text-gray-400 mb-4">
						{CurrentNews[currentIndex].content}
					</p>
					<div class="text-xs text-gray-500 dark:text-gray-400 text-right">
						News {currentIndex + 1} von {CurrentNews.length}
					</div>
				</Card>
			</div>
		{/key}

	</div>
</div>
