import { writable } from 'svelte/store';
import type { Certificate } from '$lib/types/skills';

export const certificatesStore = writable<{
	certificates: Certificate[];
	loading: boolean;
	error: string | null;
}>({
	certificates: [],
	loading: false,
	error: null
});
