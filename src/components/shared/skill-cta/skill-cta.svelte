<script lang="ts">
	import { AwardSolid } from 'flowbite-svelte-icons';
	import { Banner, Button } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { type UserSkill } from '$lib/types/skills';

	export let skillsWithoutExperience: UserSkill[];

 	function handleContinueClick() {
		goto(`/my-experiences/edit?userSkills=${skillsWithoutExperience.map(s => s.skill.id).join(',')}`);
	}
</script>

{#if skillsWithoutExperience.length > 0}
<Banner class="justify-self-center !max-w-none mb-10 z-10 flex justify-between p-4 dark:bg-gray-700 dark:border-gray-600 flex-col md:flex-row  bg-white border border-gray-100 rounded-lg shadow-sm lg:max-w-6xl top-6" dismissable="{false}"
				id="cta-banner">
	<div class="flex items-center w-full">
		<AwardSolid class="w-12 h-12 text-yellow-400 mr-4" />
		<div class="flex-1">
			<h3 class="text-xl font-bold mb-2">Vervollständige dein Skillprofil! 🚀</h3>
			<p class="text-gray-700 dark:text-gray-400">
				Du hast noch {skillsWithoutExperience.length} Skills ohne Erfahrungslevel.
				Zeige deine Expertise und hilf uns, deine Fähigkeiten besser einzuschätzen!
			</p>
		</div>
			<Button class="ml-10" color="green" outline="{true}" on:click={handleContinueClick}>Fortfahren</Button>
	</div>
</Banner>
{/if}
