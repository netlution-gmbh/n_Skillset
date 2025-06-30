export enum MessageType {
	Information = 'information',
	Error = 'error',
	Warning = 'warning'
}

export interface MessageProps {
	title: string;
	text: string;
	type: MessageType;
	isVisible?: boolean;
}
