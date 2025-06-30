import { json } from '@sveltejs/kit';
import { UserModel as PgUserModel } from '$lib/server/db/models';

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get users
 *     description: Retrieves a list of all users or a specific user by userId
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Optional user ID to filter by
 *     responses:
 *       200:
 *         description: User or list of users
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
export async function GET({ url }) {
	const userId = url.searchParams.get('userId');

	if (userId) {
		const user = await PgUserModel.findOne({ where: { userId } });
		return json(user);
	}
	const users = await PgUserModel.findAll();
	return json(users);
}

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user if the user doesn't already exist
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       200:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: object
 */
export async function POST({ request }) {
	try {
		const userData = await request.json();

		// Check if user exists
		const existingUser = await PgUserModel.findOne({ where: { accountId: userData.accountId } });

		if (existingUser) {
			return json(existingUser, { status: 200 });
		}

		const user = await PgUserModel.create(userData);
		return json(user, { status: 201 });
	} catch (e) {
		return json({ error: 'Failed to create user', details: e }, { status: 500 });
	}
}
