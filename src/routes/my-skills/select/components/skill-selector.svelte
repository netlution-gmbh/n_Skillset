<script lang="ts">
	import { Accordion, AccordionItem, Badge, Card, Checkbox, Heading, Input, Select } from 'flowbite-svelte';
	import type { Skill } from '$lib/types/skills';
	import { getDepartmentColor } from '$lib/helpers/colorHelpers';
	import { UserSkillService } from '$lib/services/userSkillService';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import { get } from 'svelte/store';

	export let skills: Skill[] = [];
	export let selectedSkills: string[] = []; // Fixed type to match usage

	let selectedDepartment = 'all';
	let searchQuery = '';
	let isLoading = true;

	// Helper function to safely get skill ID as string
	function getSkillId(skill: Skill): string {
		return skill.id?.toString() || '';
	}

	// Helper function to check if skill is selected
	function isSkillSelected(skill: Skill): boolean {
		const skillId = getSkillId(skill);
		return skillId !== '' && selectedSkills.includes(skillId);
	}

	// Load existing user skills on component mount
	onMount(async () => {
		try {
			const existingSkillIds = await UserSkillService.getSelectedSkillIds(get(authStore).userId);
			selectedSkills = existingSkillIds.map(id => id.toString());
		} catch (error) {
			console.error('Failed to load existing user skills:', error);
			// Continue with empty selection if loading fails
			selectedSkills = [];
		} finally {
			isLoading = false;
		}
	});

	$: departments = [
		{ value: 'all', name: 'Alle Abteilungen' },
		...Array.from(new Set(skills.map(skill => skill.department)))
			.filter(dept => dept) // Remove empty departments
			.map(dept => ({
				value: dept,
				name: dept
			}))
	];

	$: filteredSkills = skills.filter(skill => {
		// Only include skills with valid IDs
		if (!skill.id) return false;

		const matchesDepartment = selectedDepartment === 'all' || skill.department === selectedDepartment;
		const matchesSearch = searchQuery === '' ||
			skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			skill.description.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesDepartment && matchesSearch;
	});

	$: selectedSkillObjects = skills.filter(skill => {
		const skillId = getSkillId(skill);
		return skillId !== '' && selectedSkills.includes(skillId);
	});

	function handleSkillSelection(skill: Skill, checked: boolean) {
		const skillId = getSkillId(skill);
		if (!skillId) {
			console.warn('Cannot select skill without ID:', skill);
			return;
		}

		if (checked) {
			if (!selectedSkills.includes(skillId)) {
				selectedSkills = [...selectedSkills, skillId];
			}
		} else {
			selectedSkills = selectedSkills.filter(id => id !== skillId);
		}
	}

	// Safe text highlighting without XSS vulnerability
	function highlightText(text: string, query: string): string {
		if (!query || !text) return text;

		// Escape HTML in both text and query
		const escapeHtml = (str: string) =>
			str.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#x27;');

		const escapedText = escapeHtml(text);
		const escapedQuery = escapeHtml(query);

		const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		return escapedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
	}

	$: unitGroupedSkills = filteredSkills.reduce((acc, skill) => {
		const unit = skill.unit || 'Unbekannt';
		const dept = skill.department || 'Unbekannt';
		const category = skill.category || 'Unbekannt';

		if (!acc[unit]) {
			acc[unit] = {};
		}
		if (!acc[unit][dept]) {
			acc[unit][dept] = {};
		}
		if (!acc[unit][dept][category]) {
			acc[unit][dept][category] = [];
		}
		acc[unit][dept][category].push(skill);
		return acc;
	}, {} as Record<string, Record<string, Record<string, Skill[]>>>);
</script>

{#if isLoading}
	<div class="flex justify-center items-center p-8">
		<div class="text-gray-500">Lade bestehende Skills...</div>
	</div>
{:else}
	<div class="flex gap-4">
		<!-- Left Column -->
		<div class="w-2/3">
			<div class="flex gap-4 mb-4">
				<Select
					bind:value={selectedDepartment}
					class="w-1/2"
					items={departments}
					placeholder="Abteilung auswählen"
				/>
				<Input
					bind:value={searchQuery}
					class="w-1/2"
					placeholder="Nach Skills suchen..."
					type="search"
				/>
			</div>

			{#each Object.entries(unitGroupedSkills) as [unit, departments]}
				<div class="mb-8">
					<Heading tag="h3" class="mb-4 text-xl font-bold text-gray-900">{unit}</Heading>
					{#each Object.entries(departments) as [department, categories]}
						<div class="mb-6 pl-6">
							<Heading tag="h5" class="mb-2 text-gray-700">{department}</Heading>
							<Accordion class="bg-gray-50 mx-6 mt-6" rounded>
								{#each Object.entries(categories) as [category, categorySkills]}
									<AccordionItem>
										<span slot="header" class="ml-8">
											{category}
										</span>
										<div class="">
											{#each categorySkills as skill}
												<div class="py-1">
													<Checkbox
														class="w-full transition-colors duration-200 hover:bg-gray-100 p-2 rounded cursor-pointer"
														checked={isSkillSelected(skill)}
														on:change={(e) => {
															if (e.target instanceof HTMLInputElement) {
																handleSkillSelection(skill, e.target.checked);
															}
														}}
													>
														<div class="w-full ml-5">
															<span class="font-medium">
															<!-- eslint-disable-next-line svelte/no-at-html-tags -->
																{@html highlightText(skill.name, searchQuery)}
															</span>
															{#if skill.description}
																<p class="text-gray-500">
																	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
																	{@html highlightText(skill.description, searchQuery)}
																</p>
															{/if}
														</div>
													</Checkbox>
												</div>
											{/each}
										</div>
									</AccordionItem>
								{/each}
							</Accordion>
						</div>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Right Column -->
		<Card class="w-1/3 sticky top-4 max-h-[calc(80vh-2rem)] overflow-y-auto max-w-full">
			<Heading class="mb-4" tag="h4">Gewählte Skills ({selectedSkillObjects.length})</Heading>
			<div class="space-y-4">
				{#each selectedSkillObjects as skill}
					<div class="p-4 bg-gray-100 rounded-lg">
						<p class="font-medium text-gray-700">{skill.name}</p>
						<div class="flex flex-row gap-4 mt-2">
							<p class="text-sm text-gray-600">
								<Badge style="background: {getDepartmentColor(skill.department)}">
									{skill.department}
								</Badge>
							</p>
							<p class="text-sm text-gray-600">
								<Badge style="background: {getDepartmentColor(skill.category)}">
									{skill.category}
								</Badge>
							</p>
						</div>
					</div>
				{/each}
				{#if selectedSkillObjects.length === 0}
					<p class="text-gray-500 italic">Keine Skills gewählt</p>
				{/if}
			</div>
		</Card>
	</div>
{/if}
