<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	export let label: string;
	export let value: number = 0;
	export let id: string;

	function adjustNumber(currentValue: number, amount: number) {
		value = (currentValue || 0) + amount;
		if (value < 0) value = 0;
		handleValueChange();
	}

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

<Label for={id}>{label}</Label>
<div class="flex mb-6">
	<Button class="rounded-r-none" color="light" on:click={() => adjustNumber(value, -1)} size="sm">-</Button>
	<Input bind:value={value} class="w-20 text-center rounded-none border-x-0" {id} on:change={handleValueChange}
				 type="number" />
	<Button class="rounded-l-none" color="light" on:click={() => adjustNumber(value, 1)} size="sm">+</Button>
</div>
