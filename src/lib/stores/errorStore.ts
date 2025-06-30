import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ErrorInfo = {
	title: string;
	message: string;
} | null;

// Create a writable store with persistence
function createErrorStore() {
	const { subscribe, set } = writable<ErrorInfo>(null);

	return {
		subscribe,
		set: (value: ErrorInfo) => {
			// Save to sessionStorage when setting a value
			if (browser && value) {
				sessionStorage.setItem('errorInfo', JSON.stringify(value));
			}
			set(value);
		},
		clear: () => {
			if (browser) {
				sessionStorage.removeItem('errorInfo');
			}
			set(null);
		},
		// Initialize from storage
		init: () => {
			if (browser) {
				const stored = sessionStorage.getItem('errorInfo');
				if (stored) {
					set(JSON.parse(stored));
				}
			}
		}
	};
}

export const errorStore = createErrorStore();
