<script lang="ts">
	import { Badge, Button, Card, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { BriefcaseSolid, DotsVerticalOutline, TagSolid } from 'flowbite-svelte-icons';
	import type { UserSkill } from '$lib/types/skills';
	import { hasSkillExperience } from '$lib/helpers/skillHelpers';
	import { goto } from '$app/navigation';
	import { getCategoryColor, getDepartmentColor } from '$lib/helpers/colorHelpers';
	import { UserSkillService } from '$lib/services/userSkillService';

	export let userSkill: UserSkill;
	export let onSkillDeleted: (skillId: number) => void;

	// State management
	let isDeleting = false;
	let error: string | null = null;

	// Computed values
	$: departmentColor = getDepartmentColor(userSkill.skill.department);
	$: categoryColor = getCategoryColor(userSkill.skill.category);
	$: hasExperience = hasSkillExperience(userSkill);

	function handleAddExperienceClick() {
		goto(`/my-experiences/edit?userSkills=${userSkill.skill.id}`);
	}

	async function handleDelete() {
		if (isDeleting) return;

		try {
			isDeleting = true;
			error = null;

			await UserSkillService.deleteUserSkill(userSkill.userId, userSkill.skill.id);
			onSkillDeleted(userSkill.skill.id);
		} catch (err) {
			console.error('Failed to delete skill:', err);
			error = err instanceof Error ? err.message : 'Fehler beim Löschen des Skills';
		} finally {
			isDeleting = false;
		}
	}

</script>

<Card
	class="h-full flex flex-col max-h-fit bg-gray-100 hover:scale-102 transition-transform min-w-[300px] cursor-pointer"
	role="button"
	aria-label="Skill: {userSkill.skill.name}"
	on:click={handleAddExperienceClick}
>
	<div class="flex justify-between mb-2 relative">
		<Badge color="yellow" size="xl">Skill</Badge>
		<div class="absolute right-0" role="none" on:click|stopPropagation>
			<Button
				class="w-fit max-w-4"
				color="none"
				size="xs"
				disabled={isDeleting}
				aria-label="Optionen für {userSkill.skill.name}"
			>
				<DotsVerticalOutline />
			</Button>
			<Dropdown placement="bottom-end">
				<DropdownItem
					on:click={handleDelete}
					disabled={isDeleting}
					class="text-red-600"
				>
					{isDeleting ? 'Wird gelöscht...' : 'Löschen'}
				</DropdownItem>
			</Dropdown>
		</div>
	</div>

	{#if error}
		<div class="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
			{error}
		</div>
	{/if}

	<h5 class="mb-2 text-l font-bold tracking-tight text-gray-900 dark:text-white">
		{userSkill.skill.name}
	</h5>

	<p class="mb-6 font-normal text-gray-700 dark:text-gray-400 flex-grow">
		{userSkill.skill.description || 'Keine Beschreibung verfügbar'}
	</p>

	<div class="flex gap-2 mb-8 flex-wrap">
		<Badge
			style="background-color: {departmentColor}"
			title="Abteilung: {userSkill.skill.department}"
		>
			<BriefcaseSolid class="w-3 h-3 mr-1" />
			{userSkill.skill.department}
		</Badge>
		<Badge
			style="background-color: {categoryColor}"
			title="Kategorie: {userSkill.skill.category}"
		>
			<TagSolid class="w-3 h-3 mr-1" />
			{userSkill.skill.category}
		</Badge>
	</div>

	<div class="mt-auto" role="none" on:click|stopPropagation>
		<Button
			class="w-full"
			color={hasExperience ? "light" : "primary"}
			disabled={isDeleting}
			on:click={handleAddExperienceClick}
			aria-label="{hasExperience ? 'Erfahrung bearbeiten' : 'Erfahrung hinzufügen'} für {userSkill.skill.name}"
		>
			{hasExperience ? 'Erfahrung bearbeiten' : 'Erfahrung hinzufügen'}
		</Button>
	</div>
</Card>

<style>
    :global(.hover\:scale-102:hover) {
        transform: scale(1.02);
    }
</style>
