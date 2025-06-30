<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import { authenticatedFetch } from '$lib/helpers/fetchHelpers';

	export let value: string;
	export let suggestions: string[] = [];
	export let placeholder = '';
	export let id: string;

	let showSuggestions = false;
	let inputValue = '';
	let selectedIndex = -1;

	$: {
		if (value && !inputValue) {
			inputValue = value;
		}

		if (inputValue !== value) {
			value = inputValue;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showSuggestions) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = (selectedIndex + 1) % suggestions.length;
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0) {
					selectSuggestion(suggestions[selectedIndex]);
				}
				break;
			case 'Escape':
				showSuggestions = false;
				selectedIndex = -1;
				break;
		}
	}

	async function handleInput() {
		selectedIndex = -1;
		if (inputValue.length === -1) { // Disabled
			try {
				const response = await authenticatedFetch(`/api/skills/tags?search=${encodeURIComponent(inputValue)}`);

				if (response.ok) {
					suggestions = await response.json();
					showSuggestions = true;
				}
			} catch (error) {
				console.error('Error fetching suggestions:', error);
			}
		} else {
			suggestions = [];
			showSuggestions = false;
		}
	}

	function selectSuggestion(suggestion: string) {
		inputValue = suggestion;
		showSuggestions = false;
		selectedIndex = -1;
	}
</script>

<div class="relative">
	<Input
		autocomplete="off"
		bind:value={inputValue}
		{id}
		on:focus={() => showSuggestions = true}
		on:input={handleInput}
		on:keydown={handleKeydown}
		{placeholder}
	/>

	{#if showSuggestions && suggestions.length > 0}
		<div
			class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1">
			{#each suggestions as suggestion, index}
				<button
					class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 {selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}"
					on:click={() => selectSuggestion(suggestion)}
				>
					{suggestion}
				</button>
			{/each}
		</div>
	{/if}
</div>
