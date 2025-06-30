import { loadingStore } from '$lib/stores/loadingStore';

export class LoadingService {
	private static loadingTimeout: NodeJS.Timeout | null = null;
	private static isLoadingQueued = false;

	/**
	 * Show the loading spinner after a delay to prevent flickering
	 * @param delay Time in ms before showing the spinner (default: 500ms)
	 */
	static showLoading(delay: number = 500): void {
		// Clear any existing timeout to prevent multiple spinners
		if (LoadingService.loadingTimeout) {
			clearTimeout(LoadingService.loadingTimeout);
		}

		// Set a flag to track that loading has been requested
		LoadingService.isLoadingQueued = true;

		// Set a timeout to show the spinner only if loading persists
		LoadingService.loadingTimeout = setTimeout(() => {
			// Only show the spinner if loading is still queued
			if (LoadingService.isLoadingQueued) {
				loadingStore.set(true);
			}
		}, delay);
	}

	/**
	 * Hide the loading spinner immediately
	 */
	static hideLoading(): void {
		// Clear any pending timeout
		if (LoadingService.loadingTimeout) {
			clearTimeout(LoadingService.loadingTimeout);
			LoadingService.loadingTimeout = null;
		}

		// Reset the loading queued flag
		LoadingService.isLoadingQueued = false;

		// Hide the spinner
		loadingStore.set(false);
	}

	static get store() {
		return loadingStore;
	}
}
