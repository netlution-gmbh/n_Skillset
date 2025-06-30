import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/authStore';
import { getMsalInstance } from '$lib/auth/msal-config';
import { AuthService } from '$lib/services/authService';

export async function authGuard() {
	if (browser) {
		const msalInstance = await getMsalInstance();
		AuthService.initialize(msalInstance);
		await AuthService.checkAuth();

		const auth = get(authStore);

		if (!auth.isAuthenticated && location.pathname !== '/') {
			return false;
		}
	}
	return true;
}
