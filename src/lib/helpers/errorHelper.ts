import { redirect } from '@sveltejs/kit';

interface ErrorInfo {
	title: string;
	message: string;
}

export function createErrorToken(errorInfo: ErrorInfo) {
	const payload = JSON.stringify(errorInfo);
	return btoa(encodeURIComponent(payload));
}

export function decodeErrorToken(token: string) {
	try {
		// Use built-in atob for Base64 decoding
		return JSON.parse(decodeURIComponent(atob(token)));
	} catch (error) {
		console.error('Error decoding error token:', error);
		return null;
	}
}

export function showErrorPage(errorInfo: ErrorInfo) {
	const errorToken = createErrorToken(errorInfo);
	throw redirect(303, `/error?e=${errorToken}`);
}
