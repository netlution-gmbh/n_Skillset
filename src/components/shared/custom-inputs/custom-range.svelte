<script lang="ts">
	import { Label, Range } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	export let value: number;
	export let range: string[] = [];
	export let label: string = 'Level';

	const dispatch = createEventDispatcher();

	// Track previous value to detect changes
	let previousValue = value;

	// Function to handle value changes
	function handleValueChange() {
		if (value !== previousValue) {
			dispatch('change', value);
			previousValue = value;
		}
	}
</script>
<div class="relative mb-6">
	<Label class="mt-4" for="level-range">{label}</Label>
	<Range bind:value={value}
				 id="level-range" max={range.length} min="1" on:change={handleValueChange} step="1" />

	<div class="relative w-full flex justify-between mt-2">
		{#each range as r, i}
				<span class="text-sm text-gray-500 dark:text-gray-400
					{i === 0 ? 'text-start' :
						i === range.length - 1 ? 'text-end' : 'text-center'}"
							style="width: {100/range.length}%">
					{r}
				</span>
		{/each}
	</div>
</div>
