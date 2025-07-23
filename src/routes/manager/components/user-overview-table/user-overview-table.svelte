<script lang="ts">
	import { Button, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import type { ManagedUser } from '$lib/types/managed-user';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import { env } from '$env/dynamic/public';
	import type { Recipient } from '$lib/types/email';
	import { EmailService } from '$lib/services/emailService';
	import { ManagerService } from '../../services/manager-service';
	import UserDetailModal from '../user-detail-modal/user-detail-modal.svelte';
	import ConfirmationModal from '../../../../components/shared/modals/generic-modal.svelte';

	let managedUsers: ManagedUser[] = [];
	let selectedUser: ManagedUser | null = null;
	let showUserModal = false;

	// Email confirmation modal state
	let showEmailConfirmation = false;
	let selectedUserForEmail: ManagedUser | null = null;
	let isSendingEmail = false;

	onMount(async () => {
		let email = $authStore.userEmail;

		if (env.PUBLIC_DEV_MODE)
			email = env.PUBLIC_DEV_MANAGER_EMAIL || '';

		managedUsers = await ManagerService.getManagedUsers(email);
	});

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString();
	}

	function getRowColorClass(date: Date): string {
		const now = new Date();
		const lastChange = new Date(date);
		const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
		const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 3)); // -6 total

		if (lastChange.getTime() === 0) {
			return 'bg-white dark:bg-gray-800 hover:bg-primary-100';
		} else if (lastChange > threeMonthsAgo) {
			return 'bg-green-100 dark:bg-green-700 hover:bg-primary-100';
		} else if (lastChange > sixMonthsAgo) {
			return 'bg-yellow-100 dark:bg-yellow-700 hover:bg-primary-100';
		} else {
			return 'bg-red-100 dark:bg-red-700 hover:bg-primary-100';
		}
	}

	function promptSendMail(user: ManagedUser) {
		selectedUserForEmail = user;
		showEmailConfirmation = true;
	}

	async function confirmSendMail() {
		if (!selectedUserForEmail) return;

		const recipient: Recipient = {
			emailAddress: {
				address: selectedUserForEmail.email
			}
		};

		isSendingEmail = true;
		try {
			await EmailService.sendManagerReminder([recipient]);
			showEmailConfirmation = false;
			selectedUserForEmail = null;
		} catch (error) {
			console.error('Failed to send email:', error);
			// You might want to show an error message to the user here
		} finally {
			isSendingEmail = false;
		}
	}

	function cancelSendMail() {
		selectedUserForEmail = null;
		showEmailConfirmation = false;
	}

	function openUserModal(user: ManagedUser) {
		selectedUser = user;
		showUserModal = true;
	}

	function handleRowClick(event: MouseEvent, user: ManagedUser) {
		// Prevent opening modal if clicking on the button
		const target = event.target as HTMLElement;
		if (target.closest('button')) {
			return;
		}
		openUserModal(user);
	}
</script>

<Table class="text-center mb-10" hoverable={true} shadow striped="{true}">
	<caption class="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
		Mitarbeiter
		<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">Hier ist eine Liste deiner Mitarbeiter, wann
			diese sich das letzte Mal eingeloggt und ein Update an ihren Skills oder Erfahrungen durchgeführt haben.</p>
	</caption>
	<TableHead class="bg-orange-200">
		<TableHeadCell>Name</TableHeadCell>
		<TableHeadCell>Email</TableHeadCell>
		<TableHeadCell># Skills</TableHeadCell>
		<TableHeadCell># Erfahrungen</TableHeadCell>
		<TableHeadCell>Letzte Änderung</TableHeadCell>
		<TableHeadCell>Erinnerung senden</TableHeadCell>
	</TableHead>
	<TableBody>
		{#each managedUsers as mUser}
			<TableBodyRow
					color="custom"
					class="{getRowColorClass(mUser.lastChange)} cursor-pointer"
					on:click={(e) => handleRowClick(e, mUser)}
			>
				<TableBodyCell class="p-2">{mUser.name}</TableBodyCell>
				<TableBodyCell class="p-2">{mUser.email}</TableBodyCell>
				<TableBodyCell class="p-2">{mUser.skillsCount}</TableBodyCell>
				<TableBodyCell class="p-2">{mUser.skillsWithExperience}</TableBodyCell>
				<TableBodyCell class="p-2">{formatDate(mUser.lastChange)}</TableBodyCell>
				<TableBodyCell class="p-2">
					<Button
							size="xs"
							on:click={() => promptSendMail(mUser)}
					>
						Erinnerung senden
					</Button>
				</TableBodyCell>
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>

<UserDetailModal bind:open={showUserModal} user={selectedUser} />

{#if showEmailConfirmation && selectedUserForEmail}
	<ConfirmationModal
			bind:open={showEmailConfirmation}
			title="Erinnerung senden"
			message="Möchten Sie eine Erinnerung an <strong>{selectedUserForEmail.name}</strong> ({selectedUserForEmail.email}) senden, ihre Skills zu aktualisieren?"
			confirmText="E-Mail senden"
			cancelText="Abbrechen"
			confirmButtonColor="primary"
			isProcessing={isSendingEmail}
			onConfirm={confirmSendMail}
			onCancel={cancelSendMail}
	/>
{/if}
