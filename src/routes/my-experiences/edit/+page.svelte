<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import UserSkillEditor from './components/user-skills-editor.svelte';
	import UserSkillNavigation from '../components/user-skills-navigation.svelte';
	import PageHeader from '../../../components/layout/page-header.svelte';
	import { UserSkillService } from '$lib/services/userSkillService';
	import { LoadingService } from '$lib/services/loadingService';
	import { getCategoryColor, getDepartmentColor } from '$lib/helpers/colorHelpers';
	import { Badge } from 'flowbite-svelte';
	import { BriefcaseSolid, TagSolid } from 'flowbite-svelte-icons';
	import { EditorService } from './services/editorService';
	import { editorStore } from './stores/editorStore';
	import { authStore } from '$lib/stores/authStore';


	onMount(async () => {
		LoadingService.showLoading();

		try {
			// Get user skill IDs from URL
			const userSkillIds = $page.url.searchParams.get('userSkills')?.split(',') || [];

			// Fetch user skills
			const skills = await UserSkillService.getUserSkills(userSkillIds, $authStore.userId);

			// Initialize the editor service with the fetched skills
			EditorService.initialize(skills);
		} catch (error) {
			console.error('Error loading skills:', error);
		} finally {
			LoadingService.hideLoading();
		}
	});

	// Compute colors based on current skill
	$: departmentColor = $editorStore.currentSkill?.skill
		? getDepartmentColor($editorStore.currentSkill.skill.department)
		: '#ffffff00';

	$: categoryColor = $editorStore.currentSkill?.skill
		? getCategoryColor($editorStore.currentSkill.skill.category)
		: '#ffffff00';

</script>

{#if $editorStore.currentSkill?.skill}
	<PageHeader
		title="Erfahrungen für {$editorStore.currentSkill.skill.name}"
		description=""
		backUrl="/my-experiences"
	>
		<svelte:fragment slot="subheader">
			<div class="flex gap-2 mt-2">
				<Badge style="background-color: {departmentColor}">
					<BriefcaseSolid class="w-3 h-3 mr-1" />
					{$editorStore.currentSkill.skill.department}
				</Badge>
				<Badge style="background-color: {categoryColor}">
					<TagSolid class="w-3 h-3 mr-1" />
					{$editorStore.currentSkill.skill.category}
				</Badge>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="actions">
				<UserSkillNavigation />
		</svelte:fragment>
	</PageHeader>

	<UserSkillEditor />
{/if}
