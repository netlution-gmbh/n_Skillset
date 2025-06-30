// src/routes/api/config/status/+server.ts
import { json } from '@sveltejs/kit';
import Database from '$lib/server/db/database-connection-manager';

export async function GET() {
	return json(await Database.testConnection());
}
