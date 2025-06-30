import { ConfigService } from '$lib/services/configService';
import { SetupVerificationService, type ValidationResult } from './setup-verification-service';
import type { WizardUIState } from '../stores/wizard-store';
import { wizardStore } from '../stores/wizard-store';
import { get } from 'svelte/store';
import type { ConfigElement } from '$lib/types/config-element';

export class WizardService {
	static steps = [
		{ name: 'Willkommen', description: 'Willkommen beim Setup Wizard' },
		{ name: 'Microsoft Authentifizierung', description: 'AD Einstellungen', key: 'msal' },
		{ name: 'E-Mail', description: 'Konfigurieren des Versandes', key: 'email' },
		{ name: 'Frontend', description: 'Allgemeine Einstellungen', key: 'frontend' },
		{ name: 'Fertig', description: "Los geht's" }
	];

	// Non-reactive service data
	static config: Record<string, unknown> = {};
	static configMetadata: Record<string, unknown> = {};
	static isValidating = false;
	static showEmailTestModal = false;
	static testEmailAddress = '';
	static isTestingEmail = false;

	static get currentStep(): number {
		return WizardService.getStore().currentStep;
	}

	static async init() {
		try {
			WizardService.clearValidationResult();

			// Fetch the full admin config (which includes the template if empty)
			WizardService.config = await ConfigService.fetchAdminConfig(false);

			// Extract values and metadata from the config
			WizardService.processConfig(WizardService.config);

			WizardService.updateStore({ loading: false });
		} catch (error) {
			console.error('Failed to load configuration', error);
			WizardService.updateStore({
				validationResult: {
					isValid: false,
					message: 'Failed to load configuration. Please refresh and try again.'
				},
				loading: false
			});
		}
	}

	static async saveConfig(): Promise<ValidationResult> {
		WizardService.updateStore({ saving: true });
		WizardService.clearValidationResult();

		try {
			// Create flat object with the simplified key structure
			const valuesToUpdate: Record<string, unknown> = WizardService.getStore().inputValues;
			valuesToUpdate['initialized'] = true;
			valuesToUpdate['api.key'] = WizardService.generateApiKey();

			// Update config in the backend
			const result = await ConfigService.updateConfig(valuesToUpdate);

			if (result.success) {
				WizardService.updateStore({
					currentStep: WizardService.steps.length - 1
				});

				return {
					isValid: true,
					message: 'Configuration saved successfully!'
				};
			} else {
				return {
					isValid: false,
					message: 'Failed to save configuration'
				};
			}
		} catch (error) {
			console.error('Failed to save configuration', error);
			return { isValid: false, message: 'An error occurred while saving' };
		} finally {
			WizardService.updateStore({ saving: false });
		}
	}

	// Validation result management
	static clearValidationResult() {
		WizardService.updateStore({ validationResult: null });
	}

	// Process the flat config to extract values and metadata
	static processConfig(flatConfig: Record<string, unknown>) {
		const inputValues: Record<string, unknown> = {};

		// Extract values and metadata
		Object.entries(flatConfig).forEach(([key, value]) => {
			if (value && typeof value === 'object' && 'value' in value && 'metadata' in value) {
				// With the new structure, each key contains both value and metadata
				inputValues[key] = value.value;
				WizardService.configMetadata[key] = value.metadata;
			}
		});

		WizardService.updateStore({ inputValues });
	}

	// Validate current step
	static async validateCurrentStep(): Promise<ValidationResult> {
		const currentStepKey = WizardService.steps[WizardService.currentStep].key;

		if (currentStepKey === 'msal') {
			return await WizardService.validateMsalStep();
		} else if (currentStepKey === 'frontend') {
			const frontendResult = await WizardService.validateFrontendStep();

			if (frontendResult.isValid) {
				return this.saveConfig();
			}

			return frontendResult;
		}

		// Add other step validations here
		return { isValid: true, message: 'Step validated successfully' };
	}

	// MSAL specific validation
	static async validateMsalStep(): Promise<ValidationResult> {
		WizardService.isValidating = true;
		WizardService.clearValidationResult();

		try {
			const currentInputValues = WizardService.getStore().inputValues;

			const result = await SetupVerificationService.validateMsal({
				'msal.client_id': currentInputValues['msal.client_id'],
				'msal.authority': currentInputValues['msal.authority'],
				'msal.redirect_uri': currentInputValues['msal.redirect_uri']
			});

			WizardService.updateStore({ validationResult: result });
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			const errorResult = {
				isValid: false,
				message: `Validation failed: ${errorMessage}`
			};
			WizardService.updateStore({ validationResult: errorResult });
			return errorResult;
		} finally {
			WizardService.isValidating = false;
		}
	}

	// Email specific validation
	static async validateEmailStep(inputValues: Record<string, string>): Promise<ValidationResult> {
		WizardService.isValidating = true;
		WizardService.clearValidationResult();

		try {
			const result = await this.testEmailConfiguration(inputValues);

			WizardService.updateStore({ validationResult: result });
			return result;
		} catch (error) {
			const errorResult = {
				isValid: false,
				message: `Email validation failed: ${(error as Error).message || 'Unknown error'}`
			};
			WizardService.updateStore({ validationResult: errorResult });
			return errorResult;
		} finally {
			WizardService.isValidating = false;
		}
	}

	// Test email configuration
	static async testEmailConfiguration(currentInputValues: Record<string, string>): Promise<ValidationResult> {
		WizardService.isTestingEmail = true;
		WizardService.clearValidationResult();

		try {
			const result = await SetupVerificationService.validateEmail(
				{
					'mail.tenant_id': currentInputValues['mail.tenant_id'],
					'mail.client_id': currentInputValues['mail.client_id'],
					'mail.secret': currentInputValues['mail.secret'],
					'mail.from': currentInputValues['mail.from']
				},
				WizardService.testEmailAddress
			);
			WizardService.showEmailTestModal = false;
			WizardService.testEmailAddress = '';

			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			return {
				isValid: false,
				message: `Email test failed: ${errorMessage}`
			};
		} finally {
			WizardService.isTestingEmail = false;
		}
	}

	static async validateFrontendStep(): Promise<ValidationResult> {
		WizardService.isValidating = true;
		WizardService.clearValidationResult();

		const currentInputValues = WizardService.getStore().inputValues;

		const result: ValidationResult = SetupVerificationService.validateFrontend(
			currentInputValues['frontend.app_name'],
			currentInputValues['frontend.company_name']
		);

		WizardService.updateStore({ validationResult: result });
		WizardService.isValidating = false;
		return result;
	}

	// Move to next step
	static async nextStep() {
		const currentStep = WizardService.getStore().currentStep;

		if (currentStep < WizardService.steps.length - 1) {
			// Validate current step before proceeding
			const validation: ValidationResult = await WizardService.validateCurrentStep();

			if (!validation.isValid) {
				// Show error and don't proceed
				return;
			}

			WizardService.updateStore({
				currentStep: currentStep + 1,
				validationResult: null
			});
		}
	}

	static prevStep() {
		const currentStep = WizardService.getStore().currentStep;

		if (currentStep > 0) {
			WizardService.updateStore({
				currentStep: currentStep - 1,
				validationResult: null
			});
		}
	}

	// Gets fields for the current step
	static getCurrentStepFields(currentStep: number): ConfigElement[] {
		const currentInputValues = WizardService.getStore().inputValues;

		switch (currentStep) {
			case 0:
				return []; // Welcome screen has no fields
			case 1:
				return Object.entries(WizardService.configMetadata)
					.filter(([key]) => key.startsWith('msal'))
					.map(([key, metadata]) => ({ key, metadata, value: currentInputValues[key] }));
			case 2:
				return Object.entries(WizardService.configMetadata)
					.filter(([key]) => key.startsWith('mail'))
					.map(([key, metadata]) => ({ key, metadata, value: currentInputValues[key] }));
			case 3:
				return Object.entries(WizardService.configMetadata)
					.filter(([key]) => key.startsWith('frontend'))
					.map(([key, metadata]) => ({ key, metadata, value: currentInputValues[key] }));
			default:
				return [];
		}
	}

	// Helper methods to work with the store
	private static updateStore(updates: Partial<Parameters<typeof wizardStore.update>[0] extends (state: infer T) => unknown ? T : never>) {
		wizardStore.update((state) => ({ ...state, ...updates }));
	}

	private static getStore(): WizardUIState {
		return get(wizardStore);
	}

	private static generateApiKey() {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}
}
