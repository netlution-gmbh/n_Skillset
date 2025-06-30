import { authGuard } from '$lib/guards/auth.guard';
import { adminGuard } from '$lib/guards/admin.guard';
import { ConfigService } from '$lib/services/configService';
import { redirect } from '@sveltejs/kit';
import { configGuard } from '$lib/guards/config.guard';
import type { ConnectionStatus } from '$lib/server/db/database-connection-manager';
import { decodeErrorToken, showErrorPage } from '$lib/helpers/errorHelper';

export const load = async ({ url, fetch }) => {
	const isErrorRoute = url.pathname.startsWith('/error');

	if (isErrorRoute) {
		const errorToken = url.searchParams.get('e');
		if (errorToken) {
			return { errorInfo: decodeErrorToken(errorToken) };
		}
	}

	const database: ConnectionStatus = await configGuard(fetch);

	if (!database.canConnect)
		return showErrorPage({
			title: 'Database connection failed',
			message: 'Failed to connect to the database. Please try again later.'
		});

	if (database.canConnect && !database.isInitialized && !url.pathname.startsWith('/setup')) throw redirect(303, '/setup');
	else if (database.canConnect && database.isInitialized) {
		if (url.pathname.startsWith('/setup')) return redirect(303, '/');

		await ConfigService.fetchPublicConfig(fetch);

		let authorizedForRoute = await authGuard();

		if (!authorizedForRoute) {
			return showErrorPage({
				title: 'Authentication Error',
				message: 'You are not authorized to access this resource.'
			});
		}

		// Check Admin
		authorizedForRoute = await adminGuard();

		if (!authorizedForRoute) {
			return showErrorPage({
				title: 'Admin Access Required',
				message: 'This action requires administrator privileges.'
			});
		}

		return { showHeaderFooter: true };
	}
};
