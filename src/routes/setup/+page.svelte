
<script lang="ts">
	import { Button, Card, Spinner } from 'flowbite-svelte';
	import { ArrowLeftOutline, ArrowRightOutline, CheckCircleSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { WizardService } from './service/wizard-service';
	import { wizardStore } from './stores/wizard-store';
	import MailTestModal from '../../components/shared/modals/mail-test-modal.svelte';
	import ProgressIndicator from './components/progress-indicator.svelte';


	import ConfigForm from '../../components/shared/config-form/config-form.svelte';

	onMount(async () => {
		await WizardService.init();
	});

	let showMailTestModal = false;

	function handleNextStep() {
		showMailTestModal = false;

		if (WizardService.steps[$wizardStore.currentStep].key === 'email')
			showMailTestModal = true;
		else
			WizardService.nextStep();
	}


	function getStepEmoji(stepKey: string | undefined): string {
		const emojiMap: Record<string, string> = {
			'welcome': '🎉',
			'msal': '🔐',
			'email': '📧',
			'frontend': '🎨',
		};


		return emojiMap[stepKey? stepKey.toLowerCase() : ''] || '⚙️';
	}

</script>

<div class="mt-[36px]">
	<MailTestModal
		bind:inputValues={$wizardStore.inputValues}
		bind:open={showMailTestModal}
	></MailTestModal>
	<!-- Progress Indicator -->
	<ProgressIndicator></ProgressIndicator>

	<Card class="max-w-none">
		{#if $wizardStore.loading}
			<div class="flex justify-center items-center p-8">
				<Spinner size="12" />
				<p class="ml-4">Konfiguration wird geladen...</p>
			</div>
		{:else if $wizardStore.saving}
			<div class="flex justify-center items-center p-8">
				<Spinner size="12" />
				<p class="ml-4">Konfiguration wird gespeichert...</p>
			</div>
		{:else if $wizardStore.currentStep === 0}
			<!-- Welcome Step -->
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4">🎉 Willkommen zum Setup-Assistenten</h2>
				<p class="mb-6">Dieser Assistent führt Sie durch die Konfiguration Ihrer Anwendung. Sie können folgende Einstellungen vornehmen:</p>

				<ul class="list-disc ml-6 mb-6">
					<li class="mb-2">Microsoft-Authentifizierungseinstellungen</li>
					<li class="mb-2">E-Mail-Konfiguration</li>
					<li class="mb-2">Frontend-Aussehen und -Verhalten</li>
				</ul>

				<p class="mb-6">Klicken Sie auf "Weiter", um mit der Einrichtung Ihrer Anwendung zu beginnen.</p>
			</div>
		{:else if $wizardStore.currentStep === WizardService.steps.length - 1}
			<!-- Complete Step -->
			<div class="p-6 text-center">
				<CheckCircleSolid class="h-16 w-16 text-green-600 mx-auto mb-4" />
				<h2 class="text-2xl font-bold mb-4">Setup abgeschlossen!</h2>
				<p class="mb-6">Ihre Anwendung wurde erfolgreich konfiguriert.</p>
				<Button on:click={() => window.location.href="/"}>Zum Dashboard</Button>
			</div>
		{:else}
			<!-- Configuration Steps -->
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-2">{getStepEmoji(WizardService.steps[$wizardStore.currentStep].key)}
					{ WizardService.steps[$wizardStore.currentStep].name}</h2>
				<p class="mb-6 text-gray-600 dark:text-gray-400">
					Füllen Sie die unten stehenden Felder aus, um diesen Bereich zu konfigurieren.
					Die Eingaben werden automatisch validiert, sobald Sie auf "Weiter" klicken.
				</p>

				<ConfigForm configElements="{WizardService.getCurrentStepFields($wizardStore.currentStep)}"
				configValues="{$wizardStore.inputValues}"></ConfigForm>


				{#if $wizardStore.validationResult}
					<div
						class="p-3 rounded border { $wizardStore.validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
						<div class="flex items-center">
							{#if $wizardStore.validationResult.isValid}
								<CheckCircleSolid class="w-5 h-5 text-green-600 mr-2" />
								<span class="text-green-800 font-medium">Erfolg</span>
							{:else}
								<svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
												clip-rule="evenodd"></path>
								</svg>
								<span class="text-red-800 font-medium">Fehler</span>
							{/if}
						</div>
						<p class="mt-2 text-sm { $wizardStore.validationResult.isValid ? 'text-green-700' : 'text-red-700'}">
							{ $wizardStore.validationResult.message}
						</p>
					</div>
				{/if}


			</div>
		{/if}


		{#if $wizardStore.currentStep !== WizardService.steps.length - 1}

		<!-- Navigation Buttons -->
		<div class="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
			<Button color="light" on:click={WizardService.prevStep} disabled={$wizardStore.currentStep === 0}>
				<ArrowLeftOutline class="mr-2 h-5 w-5" />
				Zurück
			</Button>

			{#if $wizardStore.currentStep < WizardService.steps.length - 1}
				<Button on:click={handleNextStep} disabled={ $wizardStore.saving}>
					{#if $wizardStore.currentStep === WizardService.steps.length - 2}
						Konfiguration speichern
					{:else}
						Weiter
					{/if}
					<ArrowRightOutline class="ml-2 h-5 w-5" />
				</Button>
			{/if}
		</div>
		{/if}

	</Card>
</div>
