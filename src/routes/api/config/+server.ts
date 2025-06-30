import { ServerConfigService } from './services/serverConfigService';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @openapi
 * /api/config:
 *   get:
 *     summary: Get public configuration
 *     description: Retrieves all public configuration settings
 *     tags:
 *       - Configuration
 *     responses:
 *       200:
 *         description: List of public configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Config'
 */
export const GET: RequestHandler = async () => {
	const result = await ServerConfigService.getPublicConfig();
	return json(result);
};
