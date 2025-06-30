<script lang="ts">
	import { Alert, Button, Input, Label, Modal } from 'flowbite-svelte';
	import { WizardService } from '../../../routes/setup/service/wizard-service';

	export let open = false;
	export let inputValues: Record<string, string> = {};
	export let standalone = false;

	let testEmail = '';
	let isLoading = false;
	let testSuccess = false;
	let testError = '';

	async function sendTestMail() {
		if (!testEmail) {
			testError = 'Bitte geben Sie eine E-Mail-Adresse ein';
			return;
		}

		isLoading = true;
		testError = '';
		testSuccess = false;

		try {
			WizardService.testEmailAddress = testEmail;
			const result = await WizardService.validateEmailStep(inputValues);

			if (result.isValid) {
				testSuccess = true;
			} else {
				closeModal();
			}
		} finally {
			isLoading = false;
		}
	}

	function handleSkip() {
		WizardService.nextStep();
		closeModal();
	}

	function handleCancel() {
		closeModal();
	}

	function handleNext() {
		WizardService.nextStep();
		closeModal();
	}

	function closeModal() {
		open = false;
		testEmail = '';
		testSuccess = false;
		testError = '';
		isLoading = false;
	}

	// Email validation function
	function isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Reactive statement to check if email is valid
	$: isEmailValid = testEmail.trim() !== '' && isValidEmail(testEmail.trim());
</script>

<Modal bind:open outsideclose={false} size="md" title="E-Mail-Konfiguration testen">
	<div class="space-y-4">
		<p class="text-gray-600 dark:text-gray-400">
			Bevor Sie fortfahren, können Sie Ihre E-Mail-Konfiguration testen, um sicherzustellen, dass sie ordnungsgemäß funktioniert. Geben Sie unten eine
			E-Mail-Adresse ein und klicken Sie auf "Test-E-Mail senden", um Ihre Einstellungen zu überprüfen.
		</p>

		<div>
			<Label class="mb-2" for="test-email">E-Mail-Adresse zum Testen</Label>
			<Input bind:value={testEmail} disabled={isLoading || testSuccess} id="test-email" placeholder="ihre-email@beispiel.de" type="email" />
		</div>

		{#if testError}
			<Alert color="red" class="mt-4">
				<span class="font-medium">Fehler:</span>
				{testError}
			</Alert>
		{/if}

		{#if testSuccess}
			<Alert color="green" class="mt-4">
				<span class="font-medium">Erfolgreich!</span> Test-E-Mail wurde erfolgreich gesendet. Bitte überprüfen Sie Ihren Posteingang, um den Empfang zu bestätigen.
			</Alert>
		{/if}

		<div class="flex justify-center">
			<Button class="w-full" color="blue" disabled={isLoading || testSuccess || !isEmailValid} on:click={sendTestMail}>
				{#if isLoading}
					<svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Wird gesendet...
				{:else}
					Test-E-Mail senden
				{/if}
			</Button>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<div class="flex w-full justify-between">
			<Button color="light" on:click={handleCancel}>Abbrechen</Button>

			{#if !standalone}
				<Button color={testSuccess ? 'green' : 'light'} on:click={testSuccess ? handleNext : handleSkip}>
					{testSuccess ? 'Weiter' : 'Überspringen'}
				</Button>
			{/if}
		</div>
	</svelte:fragment>
</Modal>
