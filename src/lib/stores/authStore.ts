import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface AuthState {
	isAuthenticated: boolean;
	userName: string;
	userId: number; // This will now be the database-generated ID
	accountId: string; // New field for Microsoft account ID
	userEmail: string;
	isManager: boolean;
	isAdmin: boolean;
	department?: string;
	profileImage?: string;
}

// Initialize from sessionStorage if available
const storedAuth = browser ? localStorage.getItem('auth') : null;
const initialState: AuthState = storedAuth
	? JSON.parse(storedAuth)
	: {
			isAuthenticated: false,
			userName: '',
			userId: '',
			accountId: '',
			userEmail: '',
			isAdmin: false,
			isManager: false
		};

export const authStore = writable<AuthState>(initialState);

// Subscribe to changes and update sessionStorage
if (browser) {
	authStore.subscribe((state) => {
		if (state.isAuthenticated) localStorage.setItem('auth', JSON.stringify(state));
	});
}
