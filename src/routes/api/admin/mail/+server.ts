import { json, type RequestHandler } from '@sveltejs/kit';
import { EmailService } from './services/emailService';

/**
 * @openapi
 * /api/email:
 *   post:
 *     summary: Send email
 *     description: Sends an email using a template and provided data
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateData:
 *                 type: object
 *                 description: Data to populate the email template
 *               emailData:
 *                 type: object
 *                 properties:
 *                   to:
 *                     type: string
 *                     description: Recipient email address
 *                   subject:
 *                     type: string
 *                     description: Email subject
 *                   from:
 *                     type: string
 *                     description: Sender email address (optional)
 *             required:
 *               - templateData
 *               - emailData
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       500:
 *         description: Failed to send email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send email
 *                 error:
 *                   type: string
 *                   description: Error message details
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { templateData, emailData } = await request.json();

		// Send email using the service
		await EmailService.sendMail(templateData, emailData);

		return json(
			{
				success: true,
				message: 'Email sent successfully'
			},
			{
				status: 200
			}
		);
	} catch (error) {
		return json(
			{
				success: false,
				message: 'Failed to send email',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{
				status: 500
			}
		);
	}
};
