import { CertificateModel as PgCertificateModel } from '$lib/server/db/models';
import { json } from '@sveltejs/kit';

/**
 * @openapi
 * /api/certificates:
 *   post:
 *     summary: Create a new certificate
 *     description: Creates a new certificate in the system
 *     tags:
 *       - Certificates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificate'
 *     responses:
 *       200:
 *         description: Certificate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       500:
 *         description: Server error
 */
export async function POST({ request }) {
	const certificateData = await request.json();

	// For PostgreSQL, use the create method
	const newCertificate = await PgCertificateModel.create(certificateData);
	return json(newCertificate);
}
