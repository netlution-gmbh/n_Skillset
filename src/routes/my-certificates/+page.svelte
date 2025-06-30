<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import { certificatesStore } from '$lib/stores/certificatesStore';
	import type { Certificate } from '$lib/types/skills';
	import PageHeader from '../../components/layout/page-header.svelte';
	import { CertificateService } from '$lib/services/certificateService';
	import { LoadingService } from '$lib/services/loadingService';
	import { get } from 'svelte/store';
	import CertificatesCard from './components/certificates-card.svelte';

	let certificates: Certificate[] = [];
	let userId: number;
	let initialized = false;

	onMount(async () => {
		LoadingService.showLoading(0);
		userId = get(authStore).userId;

		try {
			certificates = await CertificateService.getAllUserCertificates(userId) || [];


			certificatesStore.update(store => ({
				...store,
				certificates,
				loading: false,
				error: null
			}));
		} catch (error) {
			console.error('Error loading certificates:', error);
			certificatesStore.update(store => ({
				...store,
				error: 'Failed to load certificates',
				loading: false
			}));
		}
		LoadingService.hideLoading();
		initialized = true;
	});
</script>

<PageHeader
	description="Du bist großartig. Und hier kannst die deine Zertifikate eintragen und einsehen - dann haben wir es Schwarz auf Weiß."
	title="Meine Zertifikate">
</PageHeader>

{#if initialized}
	<CertificatesCard {certificates} />
{/if}
