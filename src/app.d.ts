// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ConnectionStatus } from '$lib/server/db/database-connection-manager';

declare global {
	namespace App {
		interface Error {
			message: string;
			title: string;
		}
		// interface Locals {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				name: string;
			};
			database?: ConnectionStatus
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
