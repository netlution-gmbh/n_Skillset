<script lang="ts">
	import {
		Button,
		Card,
		Checkbox,
		Input,
		Label,
		Modal
	} from 'flowbite-svelte';
	import type { Certificate } from '$lib/types/skills';
	import { CertificateService } from '$lib/services/certificateService';
	import { certificatesStore } from '$lib/stores/certificatesStore';
	import DeleteConfirmation from '../../../components/shared/modals/delete-confirmation.svelte';
	import CertificateTable from '../../../components/shared/certificate-table/certificate-table.svelte';

	export let certificates: Certificate[] = [];

	// Modal states
	let modalOpen = false;
	let showDeleteConfirmation = false;
	let editMode = false;
	let expires = false;

	// Certificate management
	let editingCertificate: Certificate ;
	let certificateToDelete: Certificate | null = null;
	let isDeleting = false;

	// Computed properties
	$: isFormValid = editingCertificate?.name?.trim().length > 0;

	// Helper function to format dates for input elements
	function formatDateForInput(date: Date | null): string {
		if (!date) return '';

		// Handle both Date objects and date strings
		const dateObj = date instanceof Date ? date : new Date(date);

		// Check if it's a valid date and not epoch zero
		if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) return '';

		return dateObj.toISOString().split('T')[0];

	}

	// Helper function to check if renewal date is valid
	function hasValidRenewalDate(certificate: Certificate): boolean {
		return certificate.renewal_date &&
			new Date(certificate.renewal_date).getTime() > 0 &&
			new Date(certificate.renewal_date) > new Date(certificate.date);
	}

	// Update store with new certificates array
	function updateCertificatesStore(newCertificates: Certificate[]) {
		certificates = newCertificates;
		certificatesStore.update(store => ({
			...store,
			certificates: newCertificates
		}));
	}

	// Handle date change for certificate acquisition date
	function handleDateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const date = new Date(target.value);
		editingCertificate.date = date;

		// If expires is checked, update renewal date to be one year later
		if (expires && editingCertificate.date) {
			const renewalDate = new Date(date);
			renewalDate.setFullYear(renewalDate.getFullYear() + 1);
			editingCertificate.renewal_date = renewalDate;
		}
	}

	// Handle renewal date change
	function handleRenewalDateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		editingCertificate.renewal_date = new Date(target.value);
	}

	// Handle expires checkbox
	function handleExpiresChange(e: Event) {
		const target = e.target as HTMLInputElement;
		expires = target.checked;

		if (expires && editingCertificate.date) {
			const renewalDate = new Date(editingCertificate.date);
			renewalDate.setFullYear(renewalDate.getFullYear() + 1);
			editingCertificate.renewal_date = renewalDate;
		} else {
			editingCertificate.renewal_date = new Date(0);
		}
	}

	// Save the certificate (add or update)
	async function handleSave() {
		if (!isFormValid) return;

		try {
			if (editMode) {
				const updatedCertificate = await CertificateService.updateCertificate(editingCertificate);
				const updatedCertificates = certificates.map(cert =>
					cert.id === updatedCertificate.id ? updatedCertificate : cert
				);
				updateCertificatesStore(updatedCertificates);
			} else {
				const newCertificate = await CertificateService.addCertificate(editingCertificate);
				updateCertificatesStore([...certificates, newCertificate]);
			}
			closeModal();
		} catch (error) {
			console.error(`Error ${editMode ? 'updating' : 'adding'} certificate:`, error);
			// You might want to show an error message to the user here
		}
	}

	// Initialize delete confirmation
	function initiateCertificateDelete(certificate: Certificate) {
		certificateToDelete = certificate;
		showDeleteConfirmation = true;
	}

	// Confirm certificate deletion
	async function confirmDeleteCertificate() {
		if (!certificateToDelete || !certificateToDelete.id) return;

		isDeleting = true;
		try {
			await CertificateService.deleteCertificate(certificateToDelete.id);
			const updatedCertificates = certificates.filter(cert => cert.id !== certificateToDelete?.id);
			updateCertificatesStore(updatedCertificates);
			cancelDeleteCertificate();
		} catch (error) {
			console.error('Error deleting certificate:', error);
			// You might want to show an error message to the user here
		} finally {
			isDeleting = false;
		}
	}

	// Cancel certificate deletion
	function cancelDeleteCertificate() {
		certificateToDelete = null;
		showDeleteConfirmation = false;
		isDeleting = false;
	}

	// Initialize certificate editing or creation
	function editCertificate(certificate?: Certificate) {
		editMode = !!certificate;

		if (editMode && certificate) {
			editingCertificate = { ...certificate };
			expires = hasValidRenewalDate(editingCertificate);
		} else {
			editingCertificate = CertificateService.createNewCertificate();
			expires = false;
		}

		modalOpen = true;
	}

	// Close modal and reset state
	function closeModal() {
		modalOpen = false;
		editMode = false;
		expires = false;
		editingCertificate = {} as Certificate;
	}
</script>

{#if showDeleteConfirmation && certificateToDelete}
	<DeleteConfirmation
		itemName={certificateToDelete.name}
		itemType="Zertifikat"
		onConfirm={confirmDeleteCertificate}
		onCancel={cancelDeleteCertificate}
		{isDeleting}
	/>
{/if}

<Card class="max-w-none mb-5">
	<div class="pb-5">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
			Zertifikate
		</h2>
		<p class="mt-1 mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
			Hier findest du eine Übersicht über deine Zertifikate, wann diese abgeschlossen wurden und wann diese verfallen.
		</p>

		<CertificateTable
			{certificates}
			readonly={false}
			onEdit={editCertificate}
			onDelete={initiateCertificateDelete}
		/>

		<div class="mt-4 flex justify-end">
			<Button
				class="mt-2"
				on:click={() => editCertificate()}
				size="xs"
			>
				Zertifikat hinzufügen
			</Button>
		</div>
	</div>
</Card>

<Modal
	bind:open={modalOpen}
	size="lg"
	title="Zertifikat {editMode ? 'bearbeiten' : 'erstellen'}"
	autoclose={false}
>
	{#if editingCertificate}
		<div class="p-6">
			<form class="space-y-6" on:submit|preventDefault={handleSave}>
				<div>
					<Label for="certificate-name">Name</Label>
					<Input
						id="certificate-name"
						bind:value={editingCertificate.name}
						placeholder="Zertifikat Name eingeben"
						required
					/>
				</div>

				<div>
					<Label for="certificate-date">Abgeschlossen am</Label>
					<Input
						id="certificate-date"
						type="date"
						value={formatDateForInput(editingCertificate.date)}
						on:input={handleDateChange}
						required
					/>
				</div>

				<div>
					<div class="flex items-center gap-2 mb-4">
						<Checkbox
							id="certificate-expires"
							bind:checked={expires}
							on:change={handleExpiresChange}
						/>
						<Label for="certificate-expires">Läuft ab?</Label>
					</div>

					{#if expires}
						<div class="ml-6">
							<Label for="renewal-date">Bis wann muss es erneuert werden?</Label>
							<Input
								id="renewal-date"
								type="date"
								value={formatDateForInput(editingCertificate.renewal_date)}
								on:input={handleRenewalDateChange}
								required={expires}
							/>
						</div>
					{/if}
				</div>
			</form>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button
			color="primary"
			disabled={!isFormValid}
			on:click={handleSave}
		>
			Speichern
		</Button>
		<Button
			color="alternative"
			on:click={closeModal}
		>
			Abbrechen
		</Button>
	</svelte:fragment>
</Modal>
