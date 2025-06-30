import { AuthService } from '$lib/services/authService';

export async function authenticatedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
	const token = await AuthService.getAccessToken(['User.Read']);

	const headers = {
		...init?.headers,
		Authorization: `Bearer ${token}`
	};

	return fetch(input, { ...init, headers });
}
