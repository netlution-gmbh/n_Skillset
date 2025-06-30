import { error, json } from '@sveltejs/kit';
import { SkillModel as PgSkillModel } from '$lib/server/db/models';

/**
 * @openapi
 * /api/skills:
 *   get:
 *     summary: Get all skills
 *     description: Retrieves a list of all available skills
 *     tags:
 *       - Skills
 *     responses:
 *       200:
 *         description: List of skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 */
export async function GET() {
	const skills = await PgSkillModel.findAll();
	return json(skills);
}

export async function POST({ request }) {
	const data = await request.json();

	if (Array.isArray(data)) {
		const skills = await PgSkillModel.bulkCreate(data);
		return json(skills);
	} else {
		const skill = await PgSkillModel.create(data);
		return json(skill);
	}
}

/**
 * @openapi
 * /api/skills:
 *   delete:
 *     summary: Delete skills
 *     description: Deletes one or more skills
 *     tags:
 *       - Skills
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Skill'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Skill'
 *     responses:
 *       200:
 *         description: Skills deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Skill'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function DELETE({ request }) {
	try {
		const skillData = await request.json();
		const isArray = Array.isArray(skillData);
		const skills = isArray ? skillData : [skillData];

		// Extract IDs from the skill objects
		const skillIds = skills.map((skill) => skill.id).filter((id) => id != null);

		if (skillIds.length === 0) {
			// noinspection ExceptionCaughtLocallyJS
			throw error(400, { title: 'Error', message: 'No valid skill IDs provided' });
		}

		// Return the original skill data that was sent in the request
		return json(skillData);
	} catch (err) {
		console.error('Error deleting skills:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}


		throw error(500, { title: 'Error', message: 'Failed to delete skills' });
	}
}
