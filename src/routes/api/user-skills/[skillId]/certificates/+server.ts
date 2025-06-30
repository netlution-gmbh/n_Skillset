import { CertificateModel as PgCertificateModel } from '$lib/server/db/models';
import { sequelize } from '$lib/server/db/database-connection-manager';
import { error, json } from '@sveltejs/kit';

/**
 * @openapi
 * /api/user-skills/{skillId}/certificates:
 *   post:
 *     summary: Update certificates for a user skill
 *     description: Receives all certificates for a user skill and updates them in the database
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user skill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               certificates:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Certificate'
 *             required:
 *               - certificates
 *     responses:
 *       200:
 *         description: Updated certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Bad request
 */
export async function POST({ params, request }) {
	const userSkillId = params.skillId;
	const { certificates } = await request.json();

	if (!userSkillId || !certificates || !Array.isArray(certificates)) {
		throw error(400, {title: 'Error',
			message: 'User Skill ID and certificates array are required'
		});
	}

	// PostgreSQL implementation
	const transaction = await sequelize.transaction();

	try {
		// 1. Delete existing certificates for this user skill
		await PgCertificateModel.destroy({
			where: { userSkillId },
			transaction
		});

		// 2. Create all new certificates
		const certificatesToCreate = certificates.map((cert) => ({
			name: cert.name,
			userSkillId,
			date: cert.date || new Date(),
			renewal_date: cert.renewal_date || null
		}));

		const createdCertificates = await PgCertificateModel.bulkCreate(certificatesToCreate, {
			transaction
		});

		await transaction.commit();

		return json(createdCertificates);
	} catch (err) {
		await transaction.rollback();
		console.error('Error updating certificates:', err);
		throw error(500, {title: 'Error',  message: 'Failed to update certificates' });
	}
}

/**
 * @openapi
 * /api/user-skills/{skillId}/certificates:
 *   get:
 *     summary: Get certificates for a user skill
 *     description: Retrieves all certificates associated with a user skill
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user skill
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
	const userSkillId = params.skillId;

	if (!userSkillId) {
		throw error(400, {title: 'Error',
			message: 'User Skill ID is required'
		});
	}

	const certificates = await PgCertificateModel.findAll({
		where: { userSkillId },
		order: [['createdAt', 'ASC']]
	});

	return json(certificates);
}
