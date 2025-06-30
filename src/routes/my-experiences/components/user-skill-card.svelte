<script lang="ts">
	import { Badge, Button, Card, Popover } from 'flowbite-svelte';
	import { BriefcaseSolid, CheckCircleOutline, CheckCircleSolid, TagSolid } from 'flowbite-svelte-icons';
	import { Chart, type ChartConfiguration } from 'chart.js/auto';
	import type { Certificate, UserSkill } from '$lib/types/skills';
	import { goto } from '$app/navigation';
	import { calculateSkillsetScores, hasSkillExperience } from '$lib/helpers/skillHelpers';
	import { getCategoryColor, getDepartmentColor } from '$lib/helpers/colorHelpers';
	import { SkillsetService } from '$lib/services/skillsetService';
	import { onMount } from 'svelte';
	import type { SkillScore } from '$lib/types/skill-level';

	export let userSkill: UserSkill;
	export let certificates: Certificate[] = [];

	$: departmentColor = getDepartmentColor(userSkill.skill.department);
	$: categoryColor = getCategoryColor(userSkill.skill.category);

	const formatDate = (date: Date) => new Date(date).toLocaleDateString();
	const handleEdit = () => goto(`/my-experiences/edit?userSkills=${userSkill.skill.id}`);

	let template = null;
	let skillsetValues = {};
	let skillScores: SkillScore[] = [];

	onMount(async () => {
		if (userSkill.skillsetId) {
			try {
				// Get the skillset template
				template = SkillsetService.getSkillsetTemplate(userSkill.skillset?.templateId || 'default');

				// Get the skillset values
				skillsetValues = userSkill.skillset?.values || {};

				// Calculate scores
				skillScores = calculateSkillsetScores(skillsetValues, template);

				// Initialize charts after data is loaded
				initializeCharts();
			} catch (error) {
				console.error('Error loading skillset data:', error);
			}
		}
	});

	const createChart = (canvas: HTMLCanvasElement, skillScore: SkillScore) => {
		const config: ChartConfiguration = {
			type: 'doughnut',
			data: {
				datasets: [{
					data: [
						skillScore.score,
						100 - skillScore.score
					],
					backgroundColor: [
						getDepartmentColor('Score' + skillScore.name ),
						'#e5e7eb'
					],
					borderWidth: 0
				}]
			},
			options: {
				cutout: '70%',
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						enabled: false
					}
				},
				responsive: true,
				maintainAspectRatio: true
			}
		};

		return new Chart(canvas, config);
	};

	let charts: Chart[] = [];
	let chartElements: HTMLCanvasElement[] = [];

	const getChartId = (skillId: string, index: number) => `chart-${skillId}-${index}`;


	function initializeCharts() {
		// First destroy any existing charts
		charts.forEach(chart => chart.destroy());
		charts = [];

		// Create new charts
		if (chartElements.length > 0 && skillScores.length > 0) {
			charts = chartElements.map((canvas, index) => {
				if (index < skillScores.length) {
					return createChart(canvas, skillScores[index]);
				}
				return null;
			}).filter(chart => chart !== null);
		}
	}

	$: if (chartElements.length > 0 && skillScores.length > 0) {
		initializeCharts();
	}
</script>

<Card class="h-full flex flex-col max-h-fit bg-green-50 hover:scale-102 transition-transform min-w-[300px]" color="navbar" padding="lg">
	<div class="flex justify-between items-center mb-4">
		<Badge color="green" size="xl">Erfahrung</Badge>
		<div class="flex justify-end">
			{#if hasSkillExperience(userSkill)}
				<CheckCircleSolid class="w-6 h-6 text-green-500" />
			{:else}
				<CheckCircleOutline class="w-6 h-6" />
			{/if}
		</div>
	</div>

	<h5 class="mb-2 text-l font-bold tracking-tight text-gray-900 dark:text-white">
		{userSkill.skill.name}
	</h5>

	<div class="flex gap-2 mb-8 ">
		<Badge style="background-color: {departmentColor}">
			<BriefcaseSolid class="w-3 h-3 mr-1" />
			{userSkill.skill.department}
		</Badge>
		<Badge style="background-color: {categoryColor}">
			<TagSolid class="w-3 h-3 mr-1" />
			{userSkill.skill.category}
		</Badge>
	</div>

	<div class="mt-auto">
		<div class="flex justify-around mb-4 mt-4">
			{#if skillScores.length > 0}
				{#each skillScores as score, i}
					<div class="flex flex-col items-center w-1/3">
						<div class="w-16 h-16">
							<canvas id={getChartId((userSkill.skill.id || '').toString(), i)} bind:this={chartElements[i]}></canvas>
						</div>
						<div class="text-center mt-2">
							<div class="text-sm font-medium">{score.displayName}</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="text-center w-full text-sm text-gray-500">
					Keine Bewertungen verfügbar
				</div>
			{/if}
		</div>

		<div class="mt-auto">
			<Button class="w-full" color="green" on:click={() => handleEdit()} outline="{hasSkillExperience(userSkill)}">
				{#if hasSkillExperience(userSkill)}
					Erfahrung bearbeiten
				{:else}
					Erfahrung hinzufügen
				{/if}
			</Button>
		</div>
		<div class="mt-4">
			<div class="grid grid-cols-2 gap-2">
				<div>
					{#if certificates.length > 0}
						<h6 class="text-sm font-medium mb-2">Zertifikate</h6>
						{#each certificates as cert}
							<div class="flex justify-between text-sm mb-1">
								<span class="pointer-events-auto truncate">{cert.name}</span>
								<Popover placement="left">
									<span class="text-gray-500">Erhalten am: {formatDate(cert.date)}</span>
									<span class="text-gray-500">Gültig bis am: {formatDate(cert.renewal_date)}</span>
								</Popover>
							</div>
						{/each}
					{/if}
				</div>
				<div>
					{#if (userSkill?.tags?.length || 0) > 0}
						<h6 class="text-sm font-medium mb-2">Spezialisierung</h6>
						<div class="flex justify-between text-sm mb-1">
							<span class="pointer-events-auto truncate"> {userSkill.tags.map(t => t.name).join(', ')}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Card>
