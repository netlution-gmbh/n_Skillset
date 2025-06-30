import { error, json } from '@sveltejs/kit';
import { SkillModel as PgSkillModel } from '$lib/server/db/models';

/**
 * @openapi
 * /api/skills/{skillId}:
 *   patch:
 *     summary: Update a skill
 *     description: Updates a skill with new data
 *     tags:
 *       - Skills
 *     parameters:
 *       - name: skillId
 *         in: path
 *         required: true
 *         description: Skill ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skill'
 *     responses:
 *       200:
 *         description: Updated skill
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function PATCH({ params, request }) {
	const skillId = params.skillId;
	const updatedSkillData = await request.json();

	if (!skillId) {
		throw error(400, {title: 'Error',
			message: 'Skill ID is required'
		});
	}

	const skill = await PgSkillModel.findByPk(skillId);

	if (!skill) {
		throw error(404, {title: 'Error',
			message: 'Skill not found'
		});
	}

	// Update the skill with new data
	await skill.update(updatedSkillData);

	return json(skill);
}
