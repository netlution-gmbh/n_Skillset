import { json } from '@sveltejs/kit';
import { ServerConfigService } from '../../config/services/serverConfigService';

/**
 * GET handler for the admin config endpoint
 * Returns the full configuration or a flattened empty template if no config exists
 */
export async function GET() {
	try {
		// Get the full configuration
		const fullConfig = await ServerConfigService.getFullConfig();

		// Otherwise return the existing full config
		return json(fullConfig);
	} catch (error) {
		console.error('Error fetching admin configuration:', error);
		return json({ error: 'Failed to fetch configuration' }, { status: 500 });
	}
}

/**
 * PUT handler for updating the configuration
 * Only updates existing values, doesn't create new ones
 */
export async function PUT({ request }) {
	try {
		const data = await request.json();

		// Validate the incoming data
		if (!data || typeof data !== 'object') {
			return json({ error: 'Invalid request body. Expected flat config object.' }, { status: 400 });
		}

		// Update the configuration (only existing values)
		const result = await ServerConfigService.updateConfig(data, -1);

		if (result.success) {
			return json({
				message: 'Configuration updated successfully',
				updated: result.updated,
				success: true
			});
		} else {
			return json({ error: 'Failed to update configuration' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error updating configuration:', error);
		return json({ error: 'An error occurred while updating the configuration' }, { status: 500 });
	}
}
