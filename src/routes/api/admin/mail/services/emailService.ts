import { readFileSync } from 'fs';
import { Client } from '@microsoft/microsoft-graph-client';
import {
	TokenCredentialAuthenticationProvider
} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import path from 'path';
import { fileURLToPath } from 'url';
import type { EmailData, EmailMessage, TemplateData } from '$lib/types/email';
import { ServerConfigService } from '../../../config/services/serverConfigService';
import { defaultLogo } from '../data/default-logo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export class EmailService {
	private static client: Client;
	private static defaultTemplatePath = path.resolve(__dirname, '../templates/default.html');
	private static noCtaTemplatePath = path.resolve(__dirname, '../templates/noCta.html');

	static async sendMail(templateData: TemplateData, emailData: EmailData) {
		if (!this.client) await EmailService.init();

		const message = EmailService.prepareEmail(templateData, emailData);

		await this.submitEmail(message);
	}

	static async sendTestMail(tenantId: string, clientId: string, clientSecret: string, from: string, to: string) {
		// Reinitialize with the credentials
		await this.init(tenantId, clientId, clientSecret);

		const logo = (await ServerConfigService.getFullConfig())['frontend.company_logo'].value || defaultLogo;

		const message = EmailService.prepareEmail(
			{
				title: 'Email Configuration Test',
				message: 'If you received this email, your configuration is working correctly!',
				footer: 'Automated test email from the Skillset Application setup wizard.',
				logo
			},
			{
				subject: 'Email Configuration Test - Skillset Application',
				recipients: [
					{
						emailAddress: { address: to }
					}
				]
			},
			this.noCtaTemplatePath
		);

		await this.submitEmail(message, from);
	}

	private static async init(
		tenant_id?: string,
		client_id?: string,
		secret?: string
	) {

		if (!tenant_id || !client_id || !secret) {
			await ServerConfigService.initialize();
			const fullConfig = await ServerConfigService.getFullConfig();

			tenant_id = fullConfig['mail.tenant_id'].value;
			client_id = fullConfig['mail.client_id'].value;
			secret = fullConfig['mail.secret'].value;
		}

		const credential = new ClientSecretCredential(tenant_id, client_id, secret);

		const authProvider = new TokenCredentialAuthenticationProvider(credential, {
			scopes: ['https://graph.microsoft.com/.default']
		});

		EmailService.client = Client.initWithMiddleware({ authProvider });
	}

	private static prepareEmail(templateData: TemplateData, emailData: EmailData, templateFilePath = this.defaultTemplatePath) {
		return {
			subject: emailData.subject,
			body: {
				contentType: 'HTML',
				content: EmailService.prepareTemplate(templateData, templateFilePath)
			},
			toRecipients: emailData.recipients
		};
	}

	private static async submitEmail(message: EmailMessage, from?: string) {
		if (!from) {
			const fullConfig = await ServerConfigService.getFullConfig();
			from = fullConfig['mail.from'].value;
		}

		await EmailService.client.api('/users/' + from + '/sendMail').post({ message });
	}

	private static prepareTemplate(templateData: TemplateData, templateFilePath: string) {
		const template = readFileSync(templateFilePath, 'utf-8');

		// Replace all placeholders with actual data
		return template
			.replace('{{TITLE}}', templateData.title)
			.replace('{{MESSAGE}}', templateData.message)
			.replace('{{CTA_LABEL}}', templateData.cta_label ? templateData.cta_label : '')
			.replace('{{CTA_URL}}', templateData.cta_url ? templateData.cta_url : '')
			.replace('{{FOOTER}}', templateData.footer)
			.replace('{{LOGO}}', templateData.logo);
	}
}
