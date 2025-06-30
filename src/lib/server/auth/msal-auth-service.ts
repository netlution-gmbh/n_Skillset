import { env } from '$env/dynamic/private';
import { type AuthResult, BaseAuthService, type UserInfo } from './base-auth-service';

interface TokenCacheEntry {
	payload: TokenPayload;
	expiresAt: number;
}

interface TokenPayload {
	oid?: string;
	sub?: string;
	preferred_username?: string;
	upn?: string;
	email?: string;
	name?: string;
	exp?: number;
	iss?: string;
	aud?: string;
}

export class MsalAuthService extends BaseAuthService {
	private static tokenCache = new Map<string, TokenCacheEntry>();
	private static cleanupInterval: NodeJS.Timeout;

	static {
		this.startCleanupInterval();
	}

	async authenticate(request: Request): Promise<AuthResult> {
		const authHeader = request.headers.get('Authorization');

		if (!authHeader) {
			return {
				success: false,
				error: 'No authorization header provided',
				statusCode: 401
			};
		}

		const token = this.extractBearerToken(authHeader);
		const validationResult = await this.validateGraphToken(token);

		if (!validationResult.valid) {
			return {
				success: false,
				error: validationResult.error || 'Token validation failed',
				statusCode: 401
			};
		}

		const userInfo = this.extractUserFromToken(validationResult.payload as TokenPayload);

		return {
			success: true,
			userId: userInfo.id,
			userInfo
		};
	}

	async verifyAdminAccess(authHeader: string, userId: string): Promise<boolean> {
		try {
			const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/memberOf`, {
				headers: {
					Authorization: authHeader,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				console.error('Failed to fetch user groups:', response.statusText);
				return false;
			}

			const data = await response.json();
			const userGroups = data.value || [];

			return userGroups.some((group: {displayName: string}) =>
				group.displayName === 'Skillset.Admin' || group.displayName === 'Admin'
			);
		} catch (error) {
			console.error('Error verifying admin access:', error);
			return false;
		}
	}

	private static startCleanupInterval(): void {
		this.cleanupInterval = setInterval(() => {
			this.cleanExpiredTokens();
		}, 5 * 60 * 1000); // 5 minutes
	}

	private static cleanExpiredTokens(): void {
		const now = Date.now();
		for (const [token, entry] of this.tokenCache.entries()) {
			if (entry.expiresAt < now) {
				this.tokenCache.delete(token);
			}
		}
	}

	private extractBearerToken(authHeader: string): string {
		return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
	}

	private async validateGraphToken(token: string): Promise<{ valid: boolean; payload?: TokenPayload; error?: string }> {
		try {
			// Check cache first
			const cachedEntry = MsalAuthService.tokenCache.get(token);
			if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
				return { valid: true, payload: cachedEntry.payload };
			}

			if (cachedEntry) {
				MsalAuthService.tokenCache.delete(token);
			}

			// Validate token structure
			const payload = this.decodeTokenPayload(token);
			if (!payload.valid) {
				return payload;
			}

			// Validate token claims
			const claimsValidation = this.validateTokenClaims(payload.payload as TokenPayload);
			if (!claimsValidation.valid) {
				return claimsValidation;
			}

			// Cache the validated token
			this.cacheToken(token, payload.payload as TokenPayload);

			return { valid: true, payload: payload.payload };
		} catch (error) {
			console.error('Token validation error:', error);
			return { valid: false, error: 'Token validation failed' };
		}
	}

	private decodeTokenPayload(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return { valid: false, error: 'Invalid token format' };
		}

		try {
			const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
			const payloadPadded = payloadBase64 + '==='.slice(0, (4 - (payloadBase64.length % 4)) % 4);
			const payload = JSON.parse(Buffer.from(payloadPadded, 'base64').toString());

			return { valid: true, payload };
		} catch (error) {
			return { valid: false, error: 'Failed to decode token payload' + error };
		}
	}

	private validateTokenClaims(payload: TokenPayload): { valid: boolean; error?: string } {
		// Check expiration
		if (!payload.exp) {
			return { valid: false, error: 'Token missing expiration' };
		}

		if (Date.now() >= payload.exp * 1000) {
			return { valid: false, error: 'Token expired' };
		}

		// Check issuer
		const tenantId = env.TENANT_ID || '3696c327-7af2-4dda-b6c0-4ae8ad57f5e3';
		if (payload.iss !== `https://sts.windows.net/${tenantId}/`) {
			return { valid: false, error: 'Invalid token issuer' };
		}

		// Check audience
		if (payload.aud !== '00000003-0000-0000-c000-000000000000') {
			return { valid: false, error: 'Invalid token audience' };
		}

		return { valid: true };
	}

	private cacheToken(token: string, payload: TokenPayload): void {
		const expiryTime = Math.min(
			(payload.exp || 0) * 1000,
			Date.now() + 60 * 60 * 1000 // 1 hour max cache time
		);

		MsalAuthService.tokenCache.set(token, {
			payload,
			expiresAt: expiryTime
		});
	}

	private extractUserFromToken(payload: TokenPayload): UserInfo {
		return {
			id: payload.oid || payload.sub || '',
			email: payload.preferred_username || payload.upn || payload.email || '',
			name: payload.name || payload.preferred_username || ''
		};
	}

	static cleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.tokenCache.clear();
	}
}
