export interface TemplateData {
	title: string;
	message: string;
	cta_label?: string;
	cta_url?: string;
	footer: string;
	logo: string;
}

export interface EmailData {
	subject: string;
	recipients: Recipient[];
}

export interface Recipient {
	emailAddress: {
		address: string;
	};
}


export interface EmailTestRequest {
	tenant_id: string;
	client_id: string;
	secret: string;
	from: string;
	to: string;
}

export interface EmailMessage {
	subject: string,
	body: { contentType: string, content: string },
	toRecipients: Recipient[]
}
