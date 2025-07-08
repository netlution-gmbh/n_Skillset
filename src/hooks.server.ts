import type { Handle } from '@sveltejs/kit';
import Database from '$lib/server/db/database-connection-manager';
import { ServerConfigService } from './routes/api/config/services/serverConfigService';
import { requireAuth } from '$lib/server/auth';

let databaseReady = false;

export const handle: Handle = async ({ event, resolve}) => {
	if (!databaseReady) {
		const status = await Database.testConnection();

		if (status.canConnect && !status.isInitialized) {
			await Database.initializeDatabase();
			await ServerConfigService.initialize();
			databaseReady = true;
		}
	}
	// Check for valid session token for all API routes except /api/config
	if (event.url.pathname.startsWith('/api') && !event.url.pathname.startsWith('/api/config')) {
		// Use the auth middleware
		const authResponse = await requireAuth(event);

		// If authentication failed, return the error response
		if (!authResponse.ok) {
			return authResponse;
		}

	}
	return resolve(event);
};
