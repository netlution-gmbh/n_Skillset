<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import UserSkillsOverview from './components/user-skills-overview.svelte';
	import type { Certificate, UserSkill } from '$lib/types/skills';
	import PageHeader from '../../components/layout/page-header.svelte';
	import { UserSkillService } from '$lib/services/userSkillService';
	import { MessageType } from '$lib/types/message';
	import MessageBox from '../../components/layout/message-box.svelte';
	import { Button } from 'flowbite-svelte';
	import { LoadingService } from '$lib/services/loadingService';
	import { CertificateService } from '$lib/services/certificateService';
	import { loadingStore } from '$lib/stores/loadingStore';


	let userSkills: UserSkill[] = [];
	let certificates: Certificate[] = [];
	let userId: number;

	authStore.subscribe(auth => {
		userId = auth.userId;
	});

	onMount(async () => {
		LoadingService.showLoading()
		if (userId) {
			userSkills = await UserSkillService.getAllUserSkills(userId);
			certificates = await CertificateService.getAllUserCertificates(userId);
		}
		LoadingService.hideLoading()
	});
</script>
<PageHeader
	description="Hier siehst du eine Übersicht deiner Erfahrungen mit den ausgewählten Skills"
	title="Meine Erfahrungen"
>
</PageHeader>

	{#if userSkills.length > 0}
		<UserSkillsOverview {userSkills} {certificates} />
	{:else if !$loadingStore}
		<MessageBox message="{{
	text: 'Du musst zuerst Skills auswählen, bevor du Erfahrungen hinzufügen kannst. Klicke auf den Button, um die Skills auszuwählen.',
		type: MessageType.Information,
		title: 'Skills benötigt',
		}}">
			<Button href="my-skills/select">Skills auswählen</Button>
		</MessageBox>
		<p></p>
	{/if}
