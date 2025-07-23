import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/authStore';

export async function managerGuard() {
	if (browser && window.location.pathname.startsWith('/manager')) {
		const auth = get(authStore);

		// Allow access if user is admin or manager
		if (auth.isAdmin || auth.isManager) {
			return true;
		}

		return false;
	}
	return true;
}
