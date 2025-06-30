import { writable } from 'svelte/store';
import type { ValidationResult } from '../service/setup-verification-service';

export interface WizardUIState {
	currentStep: number;
	loading: boolean;
	saving: boolean;
	validationResult: ValidationResult | null;
	inputValues: Record<string, any>;
}

export const wizardStore = writable<WizardUIState>({
	currentStep: 0,
	loading: true,
	saving: false,
	validationResult: null,
	inputValues: {}
});
