<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import SkillSelector from './components/skill-selector.svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import PageHeader from '../../../components/layout/page-header.svelte';
	import { LoadingService } from '$lib/services/loadingService';
	import { UserSkillService } from '$lib/services/userSkillService';
	import { SkillService } from '$lib/services/skillService';
	import type { Skill } from '$lib/types/skills';
	import { get } from 'svelte/store';

	let skills: Skill[] = [];
	let selectedSkills: number[] = [];
	let isLoading = true;
	let isSaving = false;
	let error: string | null = null;
	let unsubscribeAuth: (() => void) | null = null;

	onMount(async () => {
		LoadingService.showLoading();

		unsubscribeAuth = authStore.subscribe(async (auth) => {
			if (!auth?.userId) {
				error = 'Benutzer nicht authentifiziert';
				isLoading = false;
				LoadingService.hideLoading();
				return;
			}

			try {
				error = null;
				const [skillsData, selectedSkillIds] = await Promise.all([
					SkillService.getAllSkills(),
					UserSkillService.getSelectedSkillIds(auth.userId)
				]);

				skills = skillsData;
				selectedSkills = selectedSkillIds;
			} catch (e) {
				console.error('Failed to load skills:', e);
				error = 'Die Skills konnten nicht geladen werden. Bitte versuchen Sie es später erneut.';
			} finally {
				isLoading = false;
				LoadingService.hideLoading();
			}
		});
	});

	onDestroy(() => {
		unsubscribeAuth?.();
	});

	async function handleSave() {
		if (isSaving) return;

		const currentAuth = get(authStore);
		if (!currentAuth?.userId) {
			error = 'Benutzer nicht authentifiziert';
			return;
		}

		try {
			isSaving = true;
			error = null;

			await UserSkillService.saveSelectedSkills(currentAuth.userId, selectedSkills);
			await goto('/my-skills');
		} catch (err) {
			console.error('Error saving skills:', err);
			error = 'Fehler beim Speichern der Skills. Bitte versuchen Sie es erneut.';
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		goto('/my-skills');
	}
</script>

{#if error}
	<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
		{error}
	</div>
{/if}

{#if !isLoading}
	<PageHeader
		title="Wähle deine Skills"
		description="Wähle die Skills aus, die zu deinem Profil passen"
	>
		<svelte:fragment slot="actions">
			{#if selectedSkills.length > 0}
				<Button
					color="alternative"
					disabled={isSaving}
					on:click={handleCancel}
				>
					Abbrechen
				</Button>
				<Button
					color="primary"
					disabled={isSaving}
					on:click={handleSave}
				>
					{isSaving ? 'Speichern...' : 'Speichern'}
				</Button>
			{/if}
		</svelte:fragment>
	</PageHeader>

	<SkillSelector {skills} bind:selectedSkills />
{:else}
	<div class="flex justify-center items-center min-h-[200px]">
		<div class="text-gray-500">Lade Skills...</div>
	</div>
{/if}
