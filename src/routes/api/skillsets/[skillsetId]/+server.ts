import { json } from '@sveltejs/kit';
import { SkillsetModel as PgSkillsetModel } from '$lib/server/db/models';

/**
 * @openapi
 * /api/skillsets/{skillsetId}:
 *   get:
 *     summary: Get a specific skillset
 *     description: Retrieves a skillset by its ID
 *     tags:
 *       - Skillsets
 *     parameters:
 *       - name: skillsetId
 *         in: path
 *         required: true
 *         description: Skillset ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skillset details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skillset'
 *       404:
 *         description: Skillset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET({ params }) {
	try {
		const { skillsetId } = params;

		const skillset = await PgSkillsetModel.findByPk(skillsetId);

		if (!skillset) {
			return json({ error: 'Skillset not found' }, { status: 404 });
		}

		return json(skillset);
	} catch (error) {
		console.error('Error fetching skill set:', error);
		return json({ error: 'Failed to fetch skill set' }, { status: 500 });
	}
}

/**
 * @openapi
 * /api/skillsets/{skillsetId}:
 *   patch:
 *     summary: Update a skillset
 *     description: Updates a skillset with new data
 *     tags:
 *       - Skillsets
 *     parameters:
 *       - name: skillsetId
 *         in: path
 *         required: true
 *         description: Skillset ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skillset'
 *     responses:
 *       200:
 *         description: Updated skillset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skillset'
 *       404:
 *         description: Skillset not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function PATCH({ params, request }) {
	try {
		const { skillsetId } = params;
		const skillsetData = await request.json();

		const skillset = await PgSkillsetModel.findByPk(skillsetId);

		if (!skillset) {
			return json({ error: 'Skillset not found' }, { status: 404 });
		}

		// Update the skillset with the new data
		skillset.set({
			...skillsetData,
			updatedAt: new Date()
		});

		await skillset.save();
		return json(skillset);
	} catch (error) {
		console.error('Error updating skill set:', error);
		return json({ error: 'Failed to update skill set' }, { status: 500 });
	}
}
