import { json } from '@sveltejs/kit';

export interface AuthResult {
	success: boolean;
	userId?: string;
	userInfo?: UserInfo;
	error?: string;
	statusCode?: number;
}

export interface UserInfo {
	id: string;
	email: string;
	name: string;
}

export abstract class BaseAuthService {
	abstract authenticate(request: Request): Promise<AuthResult>;

	protected createSuccessResponse(message = 'Authentication successful') {
		return json({ success: true, message });
	}

	protected createErrorResponse(error: string, statusCode = 401) {
		return json({ error }, { status: statusCode });
	}
}
