import type { ConnectionStatus } from '$lib/server/db/database-connection-manager';

export const configGuard = async (fetch: typeof globalThis.fetch): Promise<ConnectionStatus> => {
	const response = await fetch('/api/config/status');

	if (!response.ok) {
		throw new Error('Failed to fetch configuration status');
	}

	return (await response.json()) as ConnectionStatus;
};
