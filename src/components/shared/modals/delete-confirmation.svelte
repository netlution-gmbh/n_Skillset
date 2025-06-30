
<script lang="ts">
	import { Button, Modal } from 'flowbite-svelte';

	// Props
	export let itemName: string;
	export let itemType: string = 'Item';
	export let onConfirm: () => Promise<void>;
	export let onCancel: () => void;
	export let isDeleting: boolean = false;
	export let warningMessage: string = '';
	export let open: boolean = true;

	// Default warning message if none provided
	$: defaultWarningMessage = `Sind Sie sicher, dass Sie ${itemType.toLowerCase()} "<strong>${itemName}</strong>" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`;

	function handleCancel() {
		open = false;
		onCancel();
	}
</script>

<Modal
	bind:open
	size="md"
	title="{itemType} löschen bestätigen"
	autoclose={false}
>
	<div class="p-4 border border-red-200 rounded-lg bg-red-50">
		<p class="text-red-700 mb-4">
			<!-- eslint-disable-next-line svelte/no-at-html-tags  -->
			{@html warningMessage || defaultWarningMessage}
		</p>
	</div>

	<svelte:fragment slot="footer">
		<Button
			color="red"
			disabled={isDeleting}
			on:click={onConfirm}
		>
			{#if isDeleting}
				Wird gelöscht...
			{:else}
				Ja, löschen
			{/if}
		</Button>
		<Button
			color="gray"
			disabled={isDeleting}
			on:click={handleCancel}
		>
			Abbrechen
		</Button>
	</svelte:fragment>
</Modal>
