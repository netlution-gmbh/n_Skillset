<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowLeftOutline, ArrowRightOutline } from 'flowbite-svelte-icons';
	import { EditorService } from '../edit/services/editorService';
	import { editorStore } from '../edit/stores/editorStore';
	import { authStore } from '$lib/stores/authStore';

	// Function to handle next navigation with loading state if needed
	async function handleNavigatePrevious() {
		await EditorService.navigatePrevious()
	}
	async function handleNavigateNext() {
		await EditorService.saveChanges($authStore.userId);
		await EditorService.navigateNext();
	}
</script>

<div class="flex justify-between w-full">


	<div class="m-auto text-xl++">
		{$editorStore.navigation.currentIndex + 1} / {$editorStore.navigation.totalSkills}
	</div>

	<div class="flex gap-2">
		{#if !$editorStore.navigation.isFirst}
			<Button color="light" on:click={handleNavigatePrevious}>
				<ArrowLeftOutline class="w-4 h-4 me-2" />
				Zurück
			</Button>
		{:else}
			<div></div>
		{/if}
		{#if $editorStore.navigation.isLast}
			<Button color="primary" on:click={handleNavigateNext}>Speichern und Fertig</Button>
		{:else}
			<Button color="primary" on:click={handleNavigateNext}>Speichern und Weiter
				<ArrowRightOutline class="ms-2 w-4 h-4" />
			</Button>
		{/if}
	</div>
</div>
