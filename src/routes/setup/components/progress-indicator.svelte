<script lang="ts">
	import { WizardService } from '../service/wizard-service.js';
	import { Indicator } from 'flowbite-svelte';
	import { CheckCircleSolid } from 'flowbite-svelte-icons';
	import { wizardStore } from '../stores/wizard-store';
</script>

<div class="mb-8">
	<ol class="flex items-center w-full">
		{#each WizardService.steps as step, i}
			<li class="relative {i < WizardService.steps.length - 1 ? 'flex-1' : ''} mb-6">
				<div class="flex items-center">
					<Indicator
						size="xl"
						color={i < $wizardStore.currentStep ? "green" : i ===  $wizardStore.currentStep ? "blue" : "gray"}
						class="z-10 shrink-0 ring-0 ring-white sm:ring-8"
					>
						{#if i <  $wizardStore.currentStep}
							<CheckCircleSolid class="h-6 w-6 text-green-200 dark:text-green-300" />
						{:else}
							<span class:text-white={i ===  $wizardStore.currentStep}>{i + 1}</span>
						{/if}
					</Indicator>
					{#if i < WizardService.steps.length - 1}
						<div class="flex h-0.5 w-full {i <  $wizardStore.currentStep ? 'bg-green-200' : 'bg-gray-200 dark:bg-gray-700'}"></div>
					{/if}
				</div>
				<div class="mt-3">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white">{step.name}</h3>
					<p class="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
				</div>
			</li>
		{/each}
	</ol>
</div>
