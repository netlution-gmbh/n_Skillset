import { error, json } from '@sveltejs/kit';
import { CertificateModel as PgCertificateModel } from '$lib/server/db/models';

/**
 * @openapi
 * /api/users/{userId}/userSkills/certificates:
 *   get:
 *     summary: Get user certificates
 *     description: Retrieves all certificates associated with a user's skills
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @openapi
 * /api/users/{userId}/certificates:
 *   get:
 *     summary: Get all certificates for a user
 *     description: Retrieves all certificates associated with a specific user
 *     tags:
 *       - Certificates
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Bad request
 */
export async function GET({ params }) {
	const userId = params.userId;

	if (!userId) {
		throw error(400, {title: 'Error',
			message: 'User ID is required'
		});
	}

	const certificates = await PgCertificateModel.findAll({
		where: { userId },
		order: [['createdAt', 'ASC']]
	});

	return json(certificates);
}
