import type { ConfigStructure } from '$lib/types/config-structure';
import { authenticatedFetch } from '$lib/helpers/fetchHelpers';

export class ConfigService {
	static currentConfig: ConfigStructure | null = null;

	/**
	 * Fetches the public configuration from the API
	 * @returns The public configuration
	 */
	static async fetchPublicConfig(fetchVariant = fetch): Promise<ConfigStructure> {
		const response = await fetchVariant('/api/config');

		if (!response.ok) {
			throw new Error('Failed to load config');
		}
		const config = await response.json();
		this.currentConfig = config;
		return config;
	}

	/**
	 * Fetches the full configuration (including private items) from the admin API
	 * If no configuration exists yet, returns the flattened template
	 * @returns The full configuration
	 */
	static async fetchAdminConfig(authenticate = true): Promise<ConfigStructure> {
		const response = await (authenticate ? authenticatedFetch('/api/admin/config') : fetch('/api/admin/config'))

		if (!response.ok) {
			throw new Error('Failed to load admin config');
		}
		const config = await response.json();
		return config;
	}

	/**
	 * Updates the configuration values
	 * Only updates existing values, doesn't create new ones
	 * @param values Flat object with key-value pairs to update
	 * @returns Object with status of the update
	 */
	static async updateConfig(values: Record<string, unknown>) {
		const response = await authenticatedFetch('/api/admin/config', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});

		if (!response.ok) {
			throw new Error('Failed to update config');
		}

		const result = await response.json();

		// Update local cache after successful update if this contains public config
		await this.fetchPublicConfig();

		return result;
	}

	/**
	 * Gets a value from the config by its path
	 * @param path Dot-notation path to the config value
	 * @returns The value at the specified path or empty string if not found
	 */
	static getValue(path: string): string {
		if (!this.currentConfig) {
			console.warn('Config not loaded yet. Call fetchPublicConfig first.');
			return '';
		}

		return (this.currentConfig[path]?.value as string) || '';
	}
}
