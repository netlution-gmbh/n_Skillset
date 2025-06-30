import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EmailService } from '../services/emailService';
import type { EmailTestRequest } from '$lib/types/email';

export const POST: RequestHandler = async ({ request }) => {
	const body: EmailTestRequest = await request.json();

	// Validate required parameters
	const { tenant_id, client_id, secret, from, to } = body;

	if (!tenant_id || !client_id || !secret || !from || !to) {
		return json(
			{
				success: false,
				message: 'Missing required parameters'
			},
			{ status: 400 }
		);
	}

	try {
		// Send test email using the EmailService with test configuration
		await EmailService.sendTestMail(tenant_id, client_id, secret, from, to);
		return json(
			{
				success: true,
				message: ''
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Email test failed:', error);

		return json(
			{
				success: false,
				message: (error as Error).message
			},
			{ status: 400 }
		);
	}
};
