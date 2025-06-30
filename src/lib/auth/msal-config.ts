import { PublicClientApplication } from '@azure/msal-browser';
import { ConfigService } from '$lib/services/configService';

export let msalInstance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
	const msalConfig = {
		auth: {
			clientId: ConfigService.getValue('msal.client_id'), // Register this in Azure Portal
			authority: ConfigService.getValue('msal.authority') || '',
			redirectUri: ConfigService.getValue('msal.redirect_uri')
		},
		cache: {
			cacheLocation: 'localStorage',
			storeAuthStateInCookie: false
		}
	};

	if (!msalConfig.auth.clientId || !msalConfig.auth.redirectUri || !msalConfig.auth.authority) {
		throw new Error('MSAL_CLIENT_ID and MSAL_AUTHORITY must be defined in environment variables');
	}

	if (!msalInstance) {
		msalInstance = new PublicClientApplication(msalConfig);
		await msalInstance.initialize();
	}
	return msalInstance;
}
