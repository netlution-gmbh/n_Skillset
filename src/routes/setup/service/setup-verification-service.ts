import { PublicClientApplication } from '@azure/msal-browser';
import { AuthService } from '$lib/services/authService';
import type { EmailTestRequest } from '$lib/types/email';
import { browser } from '$app/environment';
import { authenticatedFetch } from '$lib/helpers/fetchHelpers';

export interface ValidationResult {
	isValid: boolean;
	message: string;
}

export class SetupVerificationService {
	static async validateMsal(msalSettings: { 'msal.client_id': string; 'msal.authority': string; 'msal.redirect_uri': string }): Promise<ValidationResult> {
		// Create MSAL configuration
		const msalConfig = {
			auth: {
				clientId: msalSettings['msal.client_id'],
				authority: msalSettings['msal.authority'],
				redirectUri: msalSettings['msal.redirect_uri']
			},
			cache: {
				cacheLocation: 'sessionStorage'
			}
		};

		try {
			// Try to initialize the MSAL client
			const msalInstance = new PublicClientApplication(msalConfig);
			await msalInstance.initialize();

			// Initialize AuthService with this MSAL instance
			AuthService.initialize(msalInstance);
			await AuthService.login();

			// Found users
			const foundUsers = await this.findUsers();
			if (!foundUsers.isValid) {
				return foundUsers;
			}

			// Found Admin user (User with Group of Skillset.Admin)
			const adminValidation = await this.validateAdminUser();
			if (!adminValidation.isValid) {
				return adminValidation;
			}

			return {
				isValid: true,
				message: 'Microsoft Authentication configuration is valid and admin user found'
			};
		} catch (error: any) {
			console.error('MSAL validation error:', error);

			// Extract meaningful error message
			if (error.errorCode === 'invalid_client_id') {
				return {
					isValid: false,
					message: 'Invalid Client ID'
				};
			} else if (error.errorCode === 'authority_uri_invalid') {
				return {
					isValid: false,
					message: 'Invalid Authority URL'
				};
			} else if (error.errorCode === 'redirect_uri_invalid') {
				return {
					isValid: false,
					message: 'Invalid Redirect URI'
				};
			}

			return {
				isValid: false,
				message: `MSAL configuration error: ${error.message || 'Unknown error'}`
			};
		}
	}

	/**
	 * Find and validate that users can be retrieved from Microsoft Graph
	 * Uses the existing AuthService methods
	 */
	private static async findUsers(): Promise<ValidationResult> {
		try {
			// Use AuthService to get access token
			const accessToken = await AuthService.getAccessToken(['User.Read.All']);

			// Make direct API call to get users
			const response = await fetch('https://graph.microsoft.com/v1.0/users?$top=5', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				if (response.status === 403) {
					return {
						isValid: false,
						message: 'Insufficient permissions to read users from Microsoft Graph'
					};
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const usersResponse = await response.json();

			if (!usersResponse || !usersResponse.value || usersResponse.value.length === 0) {
				return {
					isValid: false,
					message: 'No users found in Microsoft Graph. Please check permissions.'
				};
			}

			return {
				isValid: true,
				message: `Found ${usersResponse.value.length} users in Microsoft Graph`
			};
		} catch (error: any) {
			console.error('Error finding users:', error);

			return {
				isValid: false,
				message: `Error accessing Microsoft Graph: ${error.message || 'Unknown error'}`
			};
		}
	}

	/**
	 * Validate that there is at least one admin user (User with Group of Skillset.Admin)
	 * Uses the existing AuthService methods
	 */
	private static async validateAdminUser(): Promise<ValidationResult> {
		try {
			// Use AuthService to get access token
			const accessToken = await AuthService.getAccessToken(['User.Read', 'GroupMember.Read.All']);

			// Search for admin groups using direct API call
			const groupsResponse = await fetch("https://graph.microsoft.com/v1.0/groups?$filter=displayName eq 'Skillset.Admin' or displayName eq 'Admin'", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			});

			if (!groupsResponse.ok) {
				if (groupsResponse.status === 403) {
					return {
						isValid: false,
						message: 'Insufficient permissions to read groups from Microsoft Graph'
					};
				}
				throw new Error(`HTTP ${groupsResponse.status}: ${groupsResponse.statusText}`);
			}

			const groupsData = await groupsResponse.json();

			if (!groupsData || !groupsData.value || groupsData.value.length === 0) {
				return {
					isValid: false,
					message: 'No admin groups found (looking for "Skillset.Admin" or "Admin" groups)'
				};
			}

			// Check if any of the admin groups have members
			let adminUsersFound = false;
			let adminGroupName = '';

			for (const group of groupsData.value) {
				try {
					const membersResponse = await fetch(`https://graph.microsoft.com/v1.0/groups/${group.id}/members`, {
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json'
						}
					});

					if (membersResponse.ok) {
						const membersData = await membersResponse.json();
						if (membersData && membersData.value && membersData.value.length > 0) {
							adminUsersFound = true;
							adminGroupName = group.displayName;
							break;
						}
					}
				} catch (memberError) {
					console.warn(`Could not check members for group ${group.displayName}:`, memberError);
				}
			}

			if (!adminUsersFound) {
				return {
					isValid: false,
					message: 'No users found in admin groups. Please ensure at least one user is assigned to the admin group.'
				};
			}

			return {
				isValid: true,
				message: `Admin user validation successful. Found users in "${adminGroupName}" group.`
			};
		} catch (error: any) {
			console.error('Error validating admin user:', error);

			return {
				isValid: false,
				message: `Error validating admin users: ${error.message || 'Unknown error'}`
			};
		}
	}

	/**
	 * Validate email configuration by sending a test email
	 * @param emailSettings Email configuration settings
	 * @param testEmailAddress Email address to send test email to
	 * @returns ValidationResult indicating success or failure
	 */
	static async validateEmail(
		emailSettings: {
			'mail.tenant_id': string;
			'mail.client_id': string;
			'mail.secret': string;
			'mail.from': string;
		},
		testEmailAddress: string
	): Promise<ValidationResult> {
		try {
			const emailTestRequest: EmailTestRequest = {
				tenant_id: emailSettings['mail.tenant_id'],
				client_id: emailSettings['mail.client_id'],
				secret: emailSettings['mail.secret'],
				from: emailSettings['mail.from'],
				to: testEmailAddress
			};

			let fetchCall = fetch

			if(browser)
				fetchCall = authenticatedFetch

			const response = await fetchCall('/api/admin/mail/test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(emailTestRequest)
			});

			const result = await response.json();

			if (result.success) {
				return {
					isValid: true,
					message: `Test email sent successfully to ${testEmailAddress}`
				};
			} else {
				return {
					isValid: false,
					message: result.message || 'Failed to send test email'
				};
			}
		} catch (error: any) {
			console.error('Email validation error:', error);
			return {
				isValid: false,
				message: `Email configuration error: ${error.message || 'Unknown error'}`
			};
		}
	}

	/**
	 * Validates the required values for the frontend
	 * @param appName
	 * @param companyName
	 */
	static validateFrontend(appName: string, companyName: string): ValidationResult {
		if(appName.length < 3) {
			return {
				isValid: false,
				message: 'App name must be at least 3 characters long'
			};
		}
		if(companyName.length < 3) {
			return {
				isValid: false,
				message: 'Company name must be at least 3 characters long'
			}
		}

		return {
			isValid: true,
			message: 'All required values are valid'
		}
	}
}
