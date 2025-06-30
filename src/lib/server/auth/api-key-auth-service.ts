import { type AuthResult, BaseAuthService } from '$lib/server/auth/base-auth-service';
import { ServerConfigService } from '../../../routes/api/config/services/serverConfigService';

export class ApiKeyAuthService extends BaseAuthService {
	async authenticate(request: Request): Promise<AuthResult> {
		const authHeader = request.headers.get('Authorization');

		if (!authHeader) {
			return {
				success: false,
				error: 'No authorization header provided',
				statusCode: 401
			};
		}

		const [type, key] = authHeader.split(' ');
		if (type !== 'Bearer' || !key) {
			return {
				success: false,
				error: 'Invalid authorization header format',
				statusCode: 401
			};
		}

		const isValid = await this.validateApiKey(key);

		if (!isValid) {
			return {
				success: false,
				error: 'Invalid API key',
				statusCode: 401
			};
		}

		return {
			success: true,
			userId: 'api-key-user' // Could be enhanced to identify specific API keys
		};
	}

	private async validateApiKey(key: string): Promise<boolean> {
		try {
			const fullConfig = await ServerConfigService.getFullConfig();
			return key === fullConfig['api.key'].value;
		} catch (error) {
			console.error('Error validating API key:', error);
			return false;
		}
	}
}
