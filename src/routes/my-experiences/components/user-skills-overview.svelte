<script lang="ts">

	import type { Certificate, UserSkill } from '$lib/types/skills';
	import UserSkillCard from './user-skill-card.svelte';
	import SkillPagination from '../../../components/layout/skill-pagination.svelte';
	import SkillCta from '../../../components/shared/skill-cta/skill-cta.svelte';
	import { hasSkillExperience } from '$lib/helpers/skillHelpers';
	import type { ObjectId } from 'mongoose';

	export let userSkills: UserSkill[] = [];
	export let certificates: Certificate[] = [];

	const skillsWithoutExperience = userSkills
		.filter(u => !hasSkillExperience(u));

	function getUserSkillCertificates(userSkillId: ObjectId): Certificate[] {
		return certificates.filter(c => c.userSkillId === userSkillId);
	}
</script>

<SkillCta skillsWithoutExperience={skillsWithoutExperience} />
<div class="flex flex-row">
	<SkillPagination let:paginatedItems {userSkills}>
		{#each paginatedItems as userSkill}
			<UserSkillCard {userSkill} certificates="{getUserSkillCertificates(userSkill.id)}" />
		{/each}
	</SkillPagination>
</div>

