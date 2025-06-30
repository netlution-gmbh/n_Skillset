import { error, json } from '@sveltejs/kit';
import {
	SkillModel as PgSkillModel,
	SkillsetModel as PgSkillsetModel,
	UserSkillModel as PgUserSkillModel
} from '$lib/server/db/models';

/**
 * @openapi
 * /api/users/{userId}/skills:
 *   get:
 *     summary: Get user skills
 *     description: Retrieves all skills for a specific user
 *     tags:
 *       - UserSkills
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of user skills with populated skillset information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSkill'
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
		const { userId } = params;

		const userSkills = await PgUserSkillModel.findAll({
			where: { userId },
			include: [
				{ model: PgSkillsetModel, as: 'skillset' },
				{ model: PgSkillModel, as: 'skill' }
			],
			order: [['createdAt', 'ASC']]
		});

		return json(userSkills);
	} catch (error) {
		console.error('Error fetching user skills:', error);
		return json({ error: 'Failed to fetch user skills' }, { status: 500 });
	}
}

/**
 * @openapi
 * /api/users/{userId}/skills:
 *   post:
 *     summary: Add skills to user
 *     description: Adds multiple skills to a specific user
 *     tags:
 *       - UserSkills
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skillIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - skillIds
 *     responses:
 *       200:
 *         description: List of newly created user skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSkill'
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
export async function POST({ params, request }) {
	const userId = params.userId;
	const { skillIds } = await request.json();

	if (!userId || !skillIds) {
		throw error(400, {title: 'Error',
			message: 'UserId and skillIds are required'
		});
	}

	const newExperiences = [];

	for (const skillId of skillIds) {
		const existingExperience = await PgUserSkillModel.findOne({
			where: {
				userId,
				skillId
			}
		});

		if (!existingExperience) {
			const skill = await PgSkillModel.findByPk(skillId);

			if (!skill) {
				continue;
			}

			const templateId = skill.templateId || 'default';

			const skillset = await PgSkillsetModel.create({
				userId,
				templateId,
				values: {}
			});

			const newExperience = await PgUserSkillModel.create({
				userId,
				skillId,
				skillsetId: skillset.id
			});
			newExperiences.push(newExperience);
		}
	}

	return json(newExperiences);
}

/**
 * @openapi
 * /api/users/{userId}/skills:
 *   delete:
 *     summary: Delete a user skill
 *     description: Removes a specific skill from a user
 *     tags:
 *       - UserSkills
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skillId:
 *                 type: string
 *             required:
 *               - skillId
 *     responses:
 *       200:
 *         description: Skill successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *         description: User skill not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function DELETE({ params, request }) {
	const userId = params.userId;
	const { skillId } = await request.json();

	if (!userId || !skillId) {
		throw error(400, {title: 'Error',
			message: 'UserId and skillId are required'
		});
	}

	const deletedUserSkill = await PgUserSkillModel.findOne({
		where: {
			userId,
			skillId
		}
	});

	if (!deletedUserSkill) {
		throw error(404, {title: 'Error',
			message: 'UserSkill not found'
		});
	}

	await deletedUserSkill.destroy();

	return json({ message: 'UserSkill deleted successfully' });
}
