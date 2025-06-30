<script lang="ts">
	import { ConfigService } from '$lib/services/configService';
	import type { ConfigStructure } from '$lib/types/config-structure';
	import { Button, Card, TabItem, Tabs, Toast } from 'flowbite-svelte';
	import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import ConfigForm from '../../../../components/shared/config-form/config-form.svelte';
	import type { ConfigElement } from '$lib/types/config-element';
	import { onMount } from 'svelte';
	import MailTestModal from '../../../../components/shared/modals/mail-test-modal.svelte';

	let config: ConfigStructure | null = null;
	let isSaving: boolean = false;
	let showSuccessToast = false;
	let showErrorToast = false;
	let showMailTestModal = false;

	onMount(async () => {
		config = await ConfigService.fetchAdminConfig()
	})


		// Reusable function to filter config elements by prefix
	function filterConfigByPrefix(config: ConfigStructure | null, prefix: string): ConfigElement[] {
		return config ? Object.entries(config)
			.filter(([key]) => key.toLowerCase().startsWith(prefix.toLowerCase()))
			.map(([key, element]): ConfigElement => ({
				key,
				metadata: element.metadata,
				value: element.value
			})) : [];
	}

	// Filter config elements for different tabs
	$: authElements = filterConfigByPrefix(config, 'msal');
	$: mailElements = filterConfigByPrefix(config, 'mail');
	$: frontendElements = filterConfigByPrefix(config, 'frontend');
	$: apiElements = filterConfigByPrefix(config, 'api');

	$: configValues = config ? Object.fromEntries(
		Object.entries(config).map(([key, element]) => [key, element.value])
	) : {};

	async function saveConfig() {
		isSaving = true;
		if (config) {
			try {
				await ConfigService.updateConfig(configValues);
				showSuccessToast = true;
				setTimeout(() => showSuccessToast = false, 5000);
			} catch (e) {
				showErrorToast = true;
				setTimeout(() => showErrorToast = false, 10000);
			}
			isSaving = false;
		}
	}

	async function showTestModal() {
		showMailTestModal = true
	}
</script>

<MailTestModal
	bind:inputValues={configValues}
	bind:open={showMailTestModal}
></MailTestModal>
<div class="space-y-4">
	{#if config}
		<Card class="max-w-none">
			<!-- Header with title and save button -->
			<div class="flex items-center justify-between pb-4">
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
						Konfiguration
					</h2>
					<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
						Hier kannst du die Einstellungen der Skills App ändern. <b>Sei vorsichtig!</b>
					</p>
				</div>
				<Button disabled={isSaving} on:click={saveConfig}>
					{isSaving ? 'Speichern...' : 'Änderungen anwenden'}
				</Button>
			</div>

			<hr class="pb-6">

			<!-- Tabs for different config sections -->
			<Tabs >
				<TabItem  value="auth" title="Auth" open>
					<ConfigForm configElements="{authElements}" configValues="{configValues}"  />
				</TabItem>
				<TabItem value="mail" title="Mail">
					<ConfigForm configElements="{mailElements}" configValues="{configValues}"  />
					<Button on:click={showTestModal}>Testen</Button>
				</TabItem>
				<TabItem value="frontend" title="Frontend">
					<ConfigForm configElements="{frontendElements}" configValues="{configValues}"  />
				</TabItem>
				<TabItem value="api" title="API">
					<ConfigForm configElements="{apiElements}" configValues="{configValues}"  />
				</TabItem>
			</Tabs>
		</Card>
	{/if}
</div>

{#if showSuccessToast}
	<Toast position="top-right" class="mt-[80px] me-3" color="green" dismissable={true}
				 on:dismiss={() => (showSuccessToast = false)}>
		<svelte:fragment slot="icon">
			<CheckCircleSolid class="w-5 h-5" />
		</svelte:fragment>
		Configuration saved successfully
	</Toast>
{/if}

{#if showErrorToast}
	<Toast position="top-right" class="mt-[80px] me-3" color="red" dismissable={true}
				 on:dismiss={() => (showErrorToast = false)}>
		<svelte:fragment slot="icon">
			<CloseCircleSolid class="w-5 h-5" />
		</svelte:fragment>
		Failed to save configuration
	</Toast>
{/if}
