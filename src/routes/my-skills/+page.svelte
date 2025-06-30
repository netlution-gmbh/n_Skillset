
<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { type UserSkill } from '$lib/types/skills';
	import { Button } from 'flowbite-svelte';
	import PageHeader from '../../components/layout/page-header.svelte';
	import { MessageType } from '$lib/types/message';
	import MessageBox from '../../components/layout/message-box.svelte';
	import { LoadingService } from '$lib/services/loadingService';
	import { UserSkillService } from '$lib/services/userSkillService';
	import { hasSkillExperience } from '$lib/helpers/skillHelpers';
	import SkillCard from './components/skill-card.svelte';
	import SkillPagination from '../../components/layout/skill-pagination.svelte';
	import SkillCta from '../../components/shared/skill-cta/skill-cta.svelte';

	let userSkills: UserSkill[] = $state([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Optimize computed values with proper reactivity
	let skillsWithoutExperience = $derived(
		userSkills.filter(skill => !hasSkillExperience(skill))
	);

	onMount(async () => {
		try {
			LoadingService.showLoading();
			userSkills = await UserSkillService.getAllUserSkills($authStore.userId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load skills';
			console.error('Error loading user skills:', err);
		} finally {
			isLoading = false;
			LoadingService.hideLoading();
		}
	});

	const navigateToSelect = () => {
		goto('/my-skills/select');
	};

	// Optimize skill deletion handler
	function handleSkillDeleted(skillId: number) {
		userSkills = userSkills.filter(skill => skill.skill.id !== skillId);
	}
</script>

<PageHeader
	title="Meine Skills"
	description="Hier siehst du eine Übersicht deiner ausgewählten Skills"
>
	<svelte:fragment slot="actions">
		<Button color="primary" on:click={navigateToSelect}>
			Neue Skills hinzufügen
		</Button>
	</svelte:fragment>
</PageHeader>

{#if error}
	<MessageBox message={{
		text: error,
		type: MessageType.Error,
		title: 'Fehler beim Laden'
	}} />
{:else if userSkills.length === 0 && !isLoading}
	<MessageBox message={{
		text: 'Du hast noch keine Skills ausgewählt. Klicke auf den Button, um die Skills auszuwählen.',
		type: MessageType.Information,
		title: 'Skills auswählen'
	}}>
		<Button href="/my-skills/select">Skills auswählen</Button>
	</MessageBox>
{:else if userSkills.length > 0}
	<SkillCta {skillsWithoutExperience} />

	<SkillPagination let:paginatedItems {userSkills}>
		{#each paginatedItems as userSkill (userSkill.skill.id)}
			<SkillCard {userSkill} onSkillDeleted={handleSkillDeleted} />
		{/each}
	</SkillPagination>
{/if}
