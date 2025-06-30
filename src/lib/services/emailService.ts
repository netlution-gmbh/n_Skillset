import type { EmailData, Recipient, TemplateData } from '$lib/types/email';
import { authenticatedFetch } from '$lib/helpers/fetchHelpers';
import { ConfigService } from '$lib/services/configService';

export class EmailService {
	static async sendManagerReminder(recipients: Recipient[]) {
		return EmailService.sendEmail(
			{
				title: 'Update deine Skills',
				message: `Dein Teamlead hat dir eine Erinnerung geschickt, deine Skills auf den neusten Stand zu bringen.`,
				cta_label: 'Skills aktualisieren',
				cta_url: window.location.origin,
				footer: 'Automatische E-Mail von ' + ConfigService.getValue('frontend.company_name'),
				logo: ConfigService.getValue('frontend.company_logo')
			},
			{
				subject: 'Update deine Skills',
				recipients
			}
		);
	}

	static async sendEmail(templateData: TemplateData, emailData: EmailData) {
		const response = await authenticatedFetch('api/admin/mail', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				templateData,
				emailData
			})
		});

		return response.ok;
	}
}
