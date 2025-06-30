import { ServerAuthService } from './server-auth-service';

export { ServerAuthService } from './server-auth-service';
export { MsalAuthService } from './msal-auth-service';
export { ApiKeyAuthService } from './api-key-auth-service';
export type { AuthResult, UserInfo } from './base-auth-service';

// Main export for the middleware
export const requireAuth = ServerAuthService.requireAuth.bind(ServerAuthService);
