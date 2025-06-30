import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/authStore';

export async function adminGuard() {
	if (browser && window.location.pathname.startsWith('/admin')) {
		const auth = get(authStore);
		if (!auth.isAdmin) {
			return false;
		}
	}
	return true;
}
