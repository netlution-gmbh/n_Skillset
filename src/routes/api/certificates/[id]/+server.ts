import { CertificateModel as PgCertificateModel } from '$lib/server/db/models';
import { error, json } from '@sveltejs/kit';

/**
 * @openapi
 * /api/certificates/{id}:
 *   get:
 *     summary: Get certificate by ID
 *     description: Retrieves a certificate by its unique identifier
 *     tags:
 *       - Certificates
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Certificate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Certificate not found
 */
export async function GET({ params }) {
	const certificate = await PgCertificateModel.findByPk(params.id);
	if (certificate) {
		return json([certificate]);
	}
	return json([]);
}

/**
 * @openapi
 * /api/certificates/{id}:
 *   put:
 *     summary: Update a certificate
 *     description: Updates an existing certificate
 *     tags:
 *       - Certificates
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Certificate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificate'
 *     responses:
 *       200:
 *         description: Certificate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Server error
 */
export async function PUT({ params, request }) {
	const id = params.id;
	const certificateData = await request.json();

	const certificate = await PgCertificateModel.findByPk(id);
	if (!certificate) {
		throw error(404, { title: 'Error', message: 'Certificate not found' });
	}

	// Update the certificate
	await certificate.update({
		name: certificateData.name,
		date: certificateData.date,
		renewal_date: certificateData.renewal_date
	});

	return json(certificate);
}

/**
 * @openapi
 * /api/certificates/{id}:
 *   delete:
 *     summary: Delete a certificate
 *     description: Removes a certificate from the system
 *     tags:
 *       - Certificates
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Certificate ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Certificate deleted successfully
 *       404:
 *         description: Certificate not found
 */
export async function DELETE({ params }) {
	const certificate = await PgCertificateModel.findByPk(params.id);
	if (certificate) {
		await certificate.destroy();
	}

	return new Response(null, { status: 204 });
}
