
import { json, type RequestEvent } from '@sveltejs/kit';
import { MsalAuthService } from '$lib/server/auth/msal-auth-service';
import { ApiKeyAuthService } from '$lib/server/auth/api-key-auth-service';

interface AuthContext {
	isGetRequest: boolean;
	isAdminRoute: boolean;
	isManagerRoute: boolean;
	requiresAuth: boolean;
	targetAccountId?: string;
}

export class ServerAuthService {
	private static msalService = new MsalAuthService();
	private static apiKeyService = new ApiKeyAuthService();

	static async requireAuth(event: RequestEvent): Promise<Response> {
		const authContext = this.getAuthenticationContext(event);

		if (!authContext.requiresAuth) {
			return this.createSuccessResponse();
		}

		// For GET requests to non-admin/non-manager routes, try API key first
		if (authContext.isGetRequest && !authContext.isAdminRoute && !authContext.isManagerRoute) {
			const apiKeyResult = await this.apiKeyService.authenticate(event.request);
			if (apiKeyResult.success) {
				return this.createSuccessResponse();
			}
		}

		// Try MSAL authentication
		const msalResult = await this.msalService.authenticate(event.request);
		if (!msalResult.success) {
			return this.createErrorResponse(
				msalResult.error || 'Authentication failed',
				msalResult.statusCode || 401
			);
		}

		// For admin routes, verify admin access
		if (authContext.isAdminRoute) {
			const authHeader = event.request.headers.get('Authorization');
			if (!authHeader || !msalResult.userId) {
				return this.createErrorResponse('Admin verification failed', 403);
			}

			const isAdmin = await this.msalService.verifyAdminAccess(authHeader, msalResult.userId);
			if (!isAdmin) {
				const userInfo = msalResult.userInfo;
				console.log(`Admin access denied for user: ${userInfo?.name} (${userInfo?.email})`);
				return this.createErrorResponse('Forbidden - Admin access required', 403);
			}
		}

		// For manager routes, verify manager access
		if (authContext.isManagerRoute) {
			const authHeader = event.request.headers.get('Authorization');
			if (!authHeader || !msalResult.userId) {
				return this.createErrorResponse('Manager verification failed', 403);
			}

			const hasManagerAccess = await this.msalService.verifyManagerAccess(
				authHeader,
				msalResult.userId,
				authContext.targetAccountId || ''
			);

			if (!hasManagerAccess) {
				const userInfo = msalResult.userInfo;
				console.log(`Manager access denied for user: ${userInfo?.name} (${userInfo?.email})`);
				return this.createErrorResponse('Forbidden - Manager access required', 403);
			}
		}

		// Store user info in event.locals for downstream use if needed
		if (msalResult.userInfo) {
			event.locals.user = msalResult.userInfo;
		}

		return this.createSuccessResponse();
	}

	private static getAuthenticationContext(event: RequestEvent): AuthContext {
		const isGetRequest = event.request.method === 'GET';
		const isAdminRoute = event.url.pathname.includes('/admin');
		const isManagerRoute = event.url.pathname.includes('/manager');
		const isApiRoute = event.url.pathname.startsWith('/api');
		const isConfigRoute = event.url.pathname.startsWith('/api/config');

		// Extract target account ID from URL parameters for manager routes
		let targetAccountId: string | undefined;
		if (isManagerRoute) {
			const pathParts = event.url.pathname.split('/');
			const accountIdIndex = pathParts.findIndex(part => part === 'managed-users') + 1;
			if (accountIdIndex > 0 && pathParts[accountIdIndex]) {
				targetAccountId = pathParts[accountIdIndex];
			}
		}

		return {
			isGetRequest,
			isAdminRoute,
			isManagerRoute,
			requiresAuth: isApiRoute && !isConfigRoute,
			targetAccountId
		};
	}

	private static createSuccessResponse(message = 'Authentication successful') {
		return json({ success: true, message });
	}

	private static createErrorResponse(error: string, statusCode = 401) {
		return json({ error }, { status: statusCode });
	}

	static cleanup(): void {
		MsalAuthService.cleanup();
	}
}
