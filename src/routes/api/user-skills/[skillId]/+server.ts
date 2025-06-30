import { error, json } from '@sveltejs/kit';
import {
	SkillModel as PgSkillModel,
	SkillsetModel as PgSkillsetModel,
	UserSkillModel as PgUserSkillModel
} from '$lib/server/db/models';
import { Op } from 'sequelize';

/**
 * @openapi
 * /api/userSkills/{skillId}:
 *   get:
 *     summary: Get user skills by skill IDs
 *     description: Retrieves user skills matching one or more skill IDs (comma-separated)
 *     tags:
 *       - UserSkills
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID or comma-separated list of skill IDs
 *     responses:
 *       200:
 *         description: List of matching user skills
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
export async function GET({ params }) {
	const skillIdParam: string = params.skillId || '';

	if (!skillIdParam) {
		throw error(400, {
			title: 'Error',
			message: 'skillId is required'
		});
	}

	// Split the parameter by commas to get an array of skill IDs
	const skillIds = skillIdParam.split(',');

	const userSkills = await PgUserSkillModel.findAll({
		where: {
			skillId: {
				[Op.in]: skillIds
			}
		},
		include: [
			{ model: PgSkillsetModel, as: 'skillset' },
			{ model: PgSkillModel, as: 'skill' }
		],
		order: [['createdAt', 'ASC']]
	});

	return json(userSkills);
}

/**
 * @openapi
 * /api/userSkills/{skillId}:
 *   patch:
 *     summary: Update a user skill
 *     description: Updates a user skill with new skill levels and tags
 *     tags:
 *       - UserSkills
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user skill to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSkill'
 *     responses:
 *       200:
 *         description: Updated user skill
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSkill'
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
export async function PATCH({ params, request }) {
	const userId = params.skillId;
	const userSkill = await request.json();

	if (!userId || !userSkill) {
		throw error(400, {
			title: 'Error',
			message: 'UserId and userSkill data are required'
		});
	}

	const skill = await PgUserSkillModel.findOne({
		where: {
			userId,
			skillId: userSkill.skillId || userSkill.skill?.id || userSkill.skill?.id
		}
	});

	if (!skill) {
		throw error(404, {
			title: 'Error',
			message: 'UserSkill not found'
		});
	}

	skill.tags = userSkill.tags;
	skill.updatedAt = new Date();

	await skill.save();

	return json(skill);
}
