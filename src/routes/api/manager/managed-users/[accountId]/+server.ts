import { error, json } from '@sveltejs/kit';
import { SkillsetModel, UserModel, UserSkillModel } from '$lib/server/db/models';
import type { UserSkill } from '$lib/types/skills';

interface ManagedUser {
	id: number;
	accountId: string;
	skillsCount: number;
	skillsWithExperience: number;
	lastChange: Date | null;
}

/**
 * @openapi
 * /api/admin/managed-users/{userId}:
 *   get:
 *     summary: Get skills information for a specific user
 *     description: Retrieves skills statistics for a user by their account ID
 *     tags:
 *       - Users
 *       - Skills
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's account ID
 *     responses:
 *       200:
 *         description: Skills statistics for the requested user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 skillsCount:
 *                   type: integer
 *                 skillsWithExperience:
 *                   type: integer
 *                 lastChange:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       404:
 *         description: User not found
 */
export const GET = async ({ params }) => {
	const { accountId } = params;

	if (!accountId) {
		throw error(400, { title: 'Error', message: 'Account ID is required' });
	}

	// First, fetch the user by their account ID to get the user ID
	const user = await UserModel.findOne({
		where: {
			accountId: accountId
		},
		attributes: ['id', 'accountId']
	});

	if (!user) {
		throw error(404, { title: 'Error', message: 'User not found' });
	}

	// Fetch user skills with the related skillset data
	const userSkills = await UserSkillModel.findAll({
		where: {
			userId: user.id
		},
		include: [{
			model: SkillsetModel,
			as: 'skillset' // Make sure this matches your association alias
		}]
	});

	let lastChange: Date | null = null;
	if (userSkills.length > 0) {
		lastChange = new Date(Math.max(...userSkills.map((skill) => skill.updatedAt.getTime())));
	}

	// Count skills with experience
	const skillsWithExperience = (userSkills as unknown as UserSkill[]).filter((userSkill) => {
		return userSkill.skillset?.values ? Object.values(userSkill.skillset.values).length > 0 : false;
	}).length;

	const managedUser: ManagedUser = {
		id: user.id,
		accountId: user.accountId, // Return the accountId as the id
		skillsCount: userSkills.length,
		skillsWithExperience: skillsWithExperience,
		lastChange
	};

	return json(managedUser);
};
