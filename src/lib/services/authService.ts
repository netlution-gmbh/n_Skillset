import { authStore } from '$lib/stores/authStore';
import type { AccountInfo, PublicClientApplication } from '@azure/msal-browser';
import { authenticatedFetch } from '$lib/helpers/fetchHelpers';
import { goto } from '$app/navigation';
import type { ManagedUserDetails } from '$lib/types/managed-user';
import { env } from '$env/dynamic/public';

export class AuthService {
	private static msalInstance: PublicClientApplication = {} as PublicClientApplication;
	private static loginRequest = {
		scopes: ['User.Read', 'GroupMember.Read.All']
	};

	// Token cache to avoid unnecessary token requests
	private static tokenCache: {
		accessToken: string;
		expiresAt: number;
		scopes: string[];
	} | null = null;

	// Cache for admin status checks
	private static adminStatusCache: { [userId: string]: boolean } = {};

	// Cache for department information
	private static departmentCache: { [userId: string]: string } = {};

	// Cache for managed users
	private static managedUsersCache: {
		[managerEmail: string]: { users: ManagedUserDetails[]; timestamp: number };
	} = {};

	static initialize(msalInstance: PublicClientApplication) {
		AuthService.msalInstance = msalInstance;
	}

	static async getAccessToken(scopes: string[] = ['User.Read']): Promise<string> {
		// Return cached token if it's still valid and has the required scopes
		if (AuthService.tokenCache && AuthService.tokenCache.expiresAt > Date.now() && scopes.every((scope) => AuthService.tokenCache!.scopes.includes(scope))) {
			return AuthService.tokenCache.accessToken;
		}

		try {
			const account = AuthService.msalInstance.getAllAccounts()[0];
			if (!account) {
				throw new Error('No account found');
			}

			const response = await AuthService.msalInstance.acquireTokenSilent({
				scopes,
				account
			});

			// Cache the token with expiration
			AuthService.tokenCache = {
				accessToken: response.accessToken,
				expiresAt: Date.now() + (response.expiresOn ? (response.expiresOn.getTime() - Date.now() - 60000) : 0), // 1 minute buffer
				scopes
			};

			return response.accessToken;
		} catch (e) {
			console.warn('Token acquisition failed:', e);
			await AuthService.logout();
			throw e;
		}
	}

	static async login() {
		try {
			const response = await AuthService.msalInstance.loginPopup(AuthService.loginRequest);
			if (response) {
				const account = response.account;

				// Save user data in parallel with other operations
				AuthService.saveUserData(account).catch((e) => console.error('Failed to save user data:', e));

				await AuthService.setUserAuthState(account);
			}
		} catch (error) {
			console.error('Login failed:', error);
		}
	}

	static async logout() {
		// Clear all caches
		AuthService.tokenCache = null;
		AuthService.adminStatusCache = {};
		AuthService.departmentCache = {};
		AuthService.managedUsersCache = {};

		authStore.set({
			isAuthenticated: false,
			userName: '',
			isAdmin: false,
			isManager: false,
			userEmail: '',
			accountId: '',
			userId: -2
		});

		localStorage.clear();
		await goto('/');
	}

	static async checkAuth() {
		const accounts = AuthService.msalInstance.getAllAccounts();
		if (accounts.length > 0) {
			const account = accounts[0];
			try {
				await AuthService.setUserAuthState(account);
			} catch (error) {
				console.error('Authentication check failed:', error);
				await AuthService.logout();
			}
		}
	}

	static async getManagerUsers(managerEmail: string): Promise<ManagedUserDetails[]> {
		// Check cache first - cache valid for 1 hour
		const cacheEntry = AuthService.managedUsersCache[managerEmail];
		const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

		if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_TTL) {
			return cacheEntry.users;
		}

		try {
			const accessToken = await AuthService.getAccessToken(['User.Read.All']);

			const endpoint = `https://graph.microsoft.com/v1.0/users/${managerEmail}/directReports?$select=id,mail,displayName`;
			const response = await authenticatedFetch(endpoint, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (!response.ok) {
				return [];
			}

			const data = await response.json();
			const users = data.value.map((user: { id: string; mail: string; displayName: string; }) => ({
				accountId: user.id,
				email: user.mail,
				name: user.displayName
			}));

			// Update cache
			AuthService.managedUsersCache[managerEmail] = {
				users,
				timestamp: Date.now()
			};

			return users;
		} catch (error) {
			console.error('Failed to fetch managed user IDs:', error);
			return [];
		}
	}

	// Updated saveUserData method to handle accountId instead of userId
	private static async saveUserData(account: AccountInfo) {
		try {
			const response = await authenticatedFetch('/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					accountId: account.localAccountId,
					email: account.username,
					name: account.name || account.username
				})
			});

			// Parse the response to get the user data with database-generated ID
			if (response.ok) {
				return await response.json();
			}
			throw new Error('Failed to save user data');
		} catch (error) {
			console.error('Failed to save user data:', error);
			throw error;
		}
	}

	// Updated setUserAuthState method
	private static async setUserAuthState(account: AccountInfo) {
		const accessToken = await AuthService.getAccessToken(['User.Read', 'GroupMember.Read.All']);

		// Get user data from API (creates user if doesn't exist)
		const userData = await AuthService.saveUserData(account);

		// Run all these operations in parallel
		const [isAdmin, department, profileImage, managedUsers] = await Promise.all([
			AuthService.checkAdminGroup(accessToken, account.localAccountId),
			AuthService.getUserDepartment(accessToken, account.localAccountId),
			AuthService.getUserPhoto(accessToken),
			AuthService.getManagerUsers(account.username)
		]);

		const isManager = managedUsers.length > 0 || !!env.PUBLIC_DEV_MODE;

		authStore.set({
			isAuthenticated: true,
			userName: account.name || account.username,
			userEmail: account.username,
			userId: userData.id, // Use database-generated ID
			accountId: account.localAccountId, // Microsoft account ID
			isManager,
			isAdmin,
			department,
			profileImage: profileImage || ''
		});
	}

	private static async getUserPhoto(accessToken: string): Promise<string | null> {
		try {
			const endpoint = 'https://graph.microsoft.com/v1.0/me/photo/$value';
			const response = await authenticatedFetch(endpoint, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (!response.ok) return null;

			const blob = await response.blob();
			return URL.createObjectURL(blob);
		} catch (error) {
			console.error('Failed to fetch user photo:', error);
			return null;
		}
	}

	private static async getUserDepartment(accessToken: string, userId?: string) {
		// Return from cache if available
		if (userId && AuthService.departmentCache[userId]) {
			return AuthService.departmentCache[userId];
		}

		const endpoint = 'https://graph.microsoft.com/v1.0/me?$select=department';
		const response = await authenticatedFetch(endpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		const data = await response.json();

		// Cache the result if userId is provided
		if (userId) {
			AuthService.departmentCache[userId] = data.department;
		}

		return data.department;
	}

	private static async checkAdminGroup(accessToken: string, userId?: string) {
		// Return from cache if available
		if (userId && AuthService.adminStatusCache[userId] !== undefined) {
			return AuthService.adminStatusCache[userId];
		}

		const groupName = 'Skillset.Admin';
		const endpoint = `https://graph.microsoft.com/v1.0/me/memberOf`;

		try {
			const response = await authenticatedFetch(endpoint, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			const data = await response.json();
			const isAdmin = data.value.some((group: { displayName: string }) => group.displayName === groupName);

			// Cache the result if userId is provided
			if (userId) {
				AuthService.adminStatusCache[userId] = isAdmin;
			}

			return isAdmin;
		} catch (error) {
			console.error('Failed to check group membership:', error);
			return false;
		}
	}
}
