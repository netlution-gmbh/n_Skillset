import { ConfigModel } from '$lib/server/db/models';
import configTemplate from './config.json';

export class ServerConfigService {
	static TEMPLATE = configTemplate;
	private static FULL_CONFIG: Record<string, unknown> = {};
	private static synced = false;
	/// GETTER for Config to ensure config has been loaded and synced,

	static async getFullConfig(): Promise<Record<string, { value: string, metadata: unknown }>> {
		if (!this.synced) {
			await this.initialize();
		}
		return this.FULL_CONFIG;
	}

	static async initialize() {
		// Make sure config is synced (no-op if already synced)
		if(!ServerConfigService.synced)
			await ServerConfigService.syncConfig();

		ServerConfigService.FULL_CONFIG = await ServerConfigService.fetchFullConfig();
	}

	/**
	 * Flattens a structured config object into a flat key-value map
	 * @param obj The structured config object
	 * @param prefix Current key prefix for nested objects
	 * @returns A flat object with dotted-notation keys
	 */
	static flattenConfig(obj: unknown, prefix = ''): Record<string, unknown> {
		return Object.entries(obj).reduce((result: Record<string, unknown>, [key, value]) => {
			const newPrefix = prefix ? `${prefix}.${key}` : key;

			// If this is a config item with value and metadata
			if (value && typeof value === 'object' && 'value' in value && 'metadata' in value) {
				if (typeof value.value === 'object') {
					// Recursively flatten nested objects, but skip the "value" part in the path
					Object.assign(result, this.flattenConfig(value.value, newPrefix));
				} else {
					// Add leaf node with its value using simplified path
					result[newPrefix] = value.value;
				}
				// We no longer store metadata in the database
			}
			// If this is a nested object without the config structure
			else if (value && typeof value === 'object') {
				Object.assign(result, this.flattenConfig(value, newPrefix));
			}
			// Simple value
			else {
				result[newPrefix] = value;
			}

			return result;
		}, {});
	}

	/**
	 * Retrieves the public configuration (items that are not marked as private)
	 * @returns A flat key-value map of public configuration items
	 */
	static async getPublicConfig(): Promise<Record<string, unknown>> {
		try {
			const configItems = await ConfigModel.findAll({
				where: {
					isDeprecated: false,
					isPrivate: false
				}
			});

			// Create a flat map of key-value pairs
			const configMap: Record<string, unknown> = {};
			configItems.forEach((item) => {
				configMap[item.key] = item.value;
			});

			// Merge with metadata from template
			return this.enrichWithMetadata(configMap);
		} catch (error) {
			console.error('Failed to fetch public config:', error);
			return {};
		}
	}

	/**
	 * Synchronizes the database with the template config.
	 * Ensures all keys from the template exist in the database.
	 * Called once on application startup.
	 * @returns {Promise<boolean>} True if sync was successful, false otherwise
	 */
	static async syncConfig(): Promise<boolean> {
		try {
			// Get all template keys
			const templateKeys = this.getTemplateKeys();

			// Get existing config items from database
			const existingItems = await ConfigModel.findAll();

			if (existingItems.length === 0) {
				return false;
			}

			const existingKeysMap = new Map(existingItems.map((item) => [item.key, item]));

			const operations = [];

			// Mark items as deprecated if they don't exist in template
			existingItems.forEach((item) => {
				if (!templateKeys.includes(item.key) && !item.isDeprecated) {
					operations.push(
						item.update({
							isDeprecated: true
						})
					);
				}
			});

			// Create new items for template keys that don't exist in database
			for (const key of templateKeys) {
				if (!existingKeysMap.has(key)) {
					operations.push(
						ConfigModel.create({
							key,
							value: '',
							isPrivate: false,
							isDeprecated: false,
							lastUpdated: new Date(),
							updatedBy: -1
						})
					);
				}
			}

			// Execute all operations
			await Promise.all(operations);
			this.synced = true;
			return true;
		} catch (error) {
			console.error('Failed to sync config with template:', error);
			return false;
		}
	}

	/**
	 * Updates configuration values for existing keys and creates new ones if they don't exist.
	 * @param values Flat object with key-value pairs to update or create
	 * @param updatedBy ID or identifier of the user making the update
	 * @returns Object with success status and count of updated/created items
	 */
	static async updateConfig(values: Record<string, unknown>, updatedBy: number): Promise<{ success: boolean; updated: number; created: number }> {
		try {
			// Get metadata map to access isPrivate and isDeprecated from template
			const metadataMap = this.getMetadataMap();

			const keys = Object.keys(values);
			const upsertPromises: Promise<[ConfigModel, boolean | null]>[] = [];

			// Use upsert for all keys - it will update existing or create new
			keys.forEach((key) => {
				const metadata = metadataMap[key];

				upsertPromises.push(
					ConfigModel.upsert({
						key,
						value: values[key],
						isPrivate: metadata?.isPrivate ?? false,
						isDeprecated: metadata?.isDeprecated ?? false,
						lastUpdated: new Date(),
						updatedBy
					})
				);
			});

			// Execute all upsert operations
			const results = await Promise.all(upsertPromises);

			// Count how many were actually created vs updated
			// upsert returns [instance, created] where created is boolean
			const created = results.filter(([, wasCreated]) => wasCreated).length;
			const updated = results.length - created;

			return {
				success: true,
				updated,
				created
			};
		} catch (error) {
			console.error('Failed to update config:', error);
			return {
				success: false,
				updated: 0,
				created: 0
			};
		}
	}

	/**
	 * Retrieves the full configuration including private items
	 * @returns A flat key-value map of all configuration items
	 */
	private static async fetchFullConfig(): Promise<Record<string, unknown>> {
		try {
			const configItems = await ConfigModel.findAll({
				where: { isDeprecated: false }
			});

			if (configItems.length === 0) throw new Error('No config items found');

			// Create a flat map of key-value pairs
			const configMap: Record<string, unknown> = {};
			configItems.forEach((item) => {
				configMap[item.key] = item.value;
			});

			// Merge with metadata from template
			return this.enrichWithMetadata(configMap);
		} catch (error) {
			// If no config exists, return the flattened template with empty values
			const flattenedTemplate = ServerConfigService.flattenConfig(ServerConfigService.TEMPLATE);

			console.warn('Failed to fetch full config:', error);
			return this.enrichWithMetadata(flattenedTemplate);
		}
	}

	/**
	 * Enriches config values with metadata from the template
	 * @param configMap Flat map of config values
	 * @returns Enriched config with metadata
	 */
	private static enrichWithMetadata(configMap: Record<string, unknown>): Record<string, unknown> {
		const result: Record<string, unknown> = {};
		const metadataMap = this.getMetadataMap();

		// For each config value, find its metadata and combine them
		Object.entries(configMap).forEach(([key, value]) => {
			// Find metadata for this key
			const metadata = metadataMap[key] || null;

			result[key] = {
				value,
				metadata
			};
		});

		return result;
	}


	/**
	 * Creates a flat map of metadata from the template
	 * @returns Flat metadata map
	 */
	private static getMetadataMap(): Record<string, unknown> {
		const result: Record<string, unknown> = {};

		function extractMetadata(obj: unknown, path: string = '') {
			if (!obj || typeof obj !== 'object') return;

			if ('value' in obj && 'metadata' in obj) {
				result[path] = obj.metadata;
				if (typeof obj.value === 'object') {
					// Recursively extract metadata from nested objects
					extractMetadata(obj.value, path);
				}
			} else {
				// Process each property
				Object.entries(obj).forEach(([key, value]) => {
					const newPath = path ? `${path}.${key}` : key;
					if (typeof value === 'object') {
						extractMetadata(value, newPath);
					}
				});
			}
		}

		extractMetadata(this.TEMPLATE);
		return result;
	}

	/**
	 * Gets all config keys from the template
	 * @returns Array of flattened keys from the template
	 */
	private static getTemplateKeys(): string[] {
		const flattenedTemplate = this.flattenConfig(this.TEMPLATE);
		return Object.keys(flattenedTemplate);
	}
}
