
<script lang="ts">
	import { onMount } from 'svelte';
	import { SkillService } from '$lib/services/skillService';
	import type { Skill } from '$lib/types/skills';
	import { Badge, Button, Card, Label, Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox } from 'flowbite-svelte';
	import { skillsetTemplates } from '$lib/data/skillset-templates';
	import { SkillsetService } from '$lib/services/skillsetService';
	import { getCategoryColor, getDepartmentColor } from '$lib/helpers/colorHelpers';
	import SkillEditModal from './skill-edit-modal.svelte';
	import SkillUploadButton from './skill-upload-button.svelte';
	import DeleteConfirmation from '../../../../components/shared/modals/delete-confirmation.svelte';
	import { TrashBinOutline, PlusOutline, CloseOutline } from 'flowbite-svelte-icons';

	interface SelectOption {
		name: string;
		value: string;
	}

	// State variables with proper typing
	let skills: Skill[] = [];
	let filteredSkills: Skill[] = [];
	let selectedDepartment: string = 'all';
	let showTable = false;
	let modalOpen = false;
	let isDeleteMode = false;
	let selectedSkillIds: Set<string> = new Set();

	// Bulk delete confirmation state
	let showBulkDeleteConfirmation: boolean = false;
	let isBulkDeleting: boolean = false;

	// Dropdown data
	let departments: SelectOption[] = [];
	let templates: SelectOption[] = [];

	// Add this new variable to store categories by department
	let categoriesByDepartment: Record<string, SelectOption[]> = {};

	const emptySkill: Skill = {
		name: '',
		category: '',
		department: '',
		description: '',
		unit: '',
		templateId: 'default'
	};

	let selectedSkill: Skill = structuredClone(emptySkill);

	onMount(async () => {
		await updateSkills();
		showTable = true;
	});

	async function updateSkills(): Promise<void> {
		skills = await SkillService.getAllSkills();
		filteredSkills = [...skills];

		// Transform departments into SelectOption objects
		departments = Array.from(new Set(skills.map((skill) => skill.department)))
			.filter(Boolean)
			.sort()
			.map((dept) => ({
				name: dept,
				value: dept
			}));

		// Prepare categories by department
		departments.forEach((dept) => {
			const deptSkills = skills.filter((skill) => skill.department === dept.value);
			categoriesByDepartment[dept.value] = Array.from(new Set(deptSkills.map((skill) => skill.category)))
				.filter(Boolean)
				.sort()
				.map((cat) => ({
					name: cat,
					value: cat
				}));
		});

		if(departments.length === 0)
			departments.push({
				name: 'Keine Abteilung',
				value: 'all'
			});

		loadSkillsetTemplates();
	}

	function loadSkillsetTemplates(): void {
		try {
			templates = skillsetTemplates.map((template) => ({
				name: template.name,
				value: template.id
			}));
		} catch (error) {
			console.error('Failed to load skillset templates:', error);
		}
	}

	function handleDoubleClick(skill: Skill): void {
		if (isDeleteMode) return; // Disable double-click in delete mode
		selectedSkill = { ...skill };
		modalOpen = true;
	}

	async function handleSave(updatedSkill: Skill): Promise<void> {
		const savedSkill = await SkillService.updateSkill(updatedSkill);
		skills = skills.map((s) => (s.id === updatedSkill.id ? savedSkill : s));
		modalOpen = false;
		selectedSkill = structuredClone(emptySkill);
		updateTable();
	}

	function handleAddSkill(): void {
		selectedSkill = structuredClone(emptySkill);
		modalOpen = true;
	}

	function toggleDeleteMode(): void {
		isDeleteMode = !isDeleteMode;
		selectedSkillIds.clear();
		selectedSkillIds = new Set(); // Trigger reactivity
	}

	function toggleSkillSelection(skillId: string): void {
		if (selectedSkillIds.has(skillId)) {
			selectedSkillIds.delete(skillId);
		} else {
			selectedSkillIds.add(skillId);
		}
		selectedSkillIds = new Set(selectedSkillIds); // Trigger reactivity
	}

	function toggleSelectAll(): void {
		if (selectedSkillIds.size === filteredSkills.length) {
			selectedSkillIds.clear();
		} else {
			selectedSkillIds = new Set(filteredSkills.map(skill => skill.id).filter(Boolean));
		}
		selectedSkillIds = new Set(selectedSkillIds); // Trigger reactivity
	}

	function handleBulkDeleteClick(): void {
		if (selectedSkillIds.size === 0) return;
		showBulkDeleteConfirmation = true;
	}

	async function confirmBulkDelete(): Promise<void> {
		if (selectedSkillIds.size === 0) return;

		isBulkDeleting = true;
		try {
			const skillsToDelete = skills.filter(skill => skill.id && selectedSkillIds.has(skill.id));

			for (const skill of skillsToDelete) {
				await SkillService.deleteSkills(skill);
			}

			await updateSkills();
			updateTable();
			toggleDeleteMode(); // Exit delete mode after deletion
		} finally {
			isBulkDeleting = false;
			showBulkDeleteConfirmation = false;
		}
	}

	function cancelBulkDelete(): void {
		showBulkDeleteConfirmation = false;
	}

	// Reactive statements
	$: filteredSkills = selectedDepartment === 'all' ? [...skills] : skills.filter((skill) => skill.department === selectedDepartment);

	/* ISSUE https://github.com/themesberg/flowbite-svelte/issues/1493 */
	function updateTable(): void {
		showTable = false;
		setTimeout(() => (showTable = true), 100);
	}

	async function handleSkillsUploaded(event: CustomEvent) {
		await updateSkills();
		updateTable();
	}

	async function onDelete(editingSkill: Skill) {
		await SkillService.deleteSkills(editingSkill);
		await updateSkills();
		updateTable();
	}

	// Get selected skills names for confirmation message
	$: selectedSkillsNames = skills
		.filter(skill => skill.id && selectedSkillIds.has(skill.id))
		.map(skill => skill.name)
		.join(', ');
</script>

{#if showBulkDeleteConfirmation}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg max-w-md w-full mx-4">
			<DeleteConfirmation
				itemName={selectedSkillsNames}
				itemType={selectedSkillIds.size === 1 ? 'den Skill' : `${selectedSkillIds.size} Skills`}
				onConfirm={confirmBulkDelete}
				onCancel={cancelBulkDelete}
				isDeleting={isBulkDeleting}
				warningMessage={selectedSkillIds.size === 1
					? `Sind Sie sicher, dass Sie den Skill "<strong>${selectedSkillsNames}</strong>" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden und kann sich auf bestehende Bewertungen auswirken.`
					: `Sind Sie sicher, dass Sie die ${selectedSkillIds.size} ausgewählten Skills löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden und kann sich auf bestehende Bewertungen auswirken.`
				}
			/>
		</div>
	</div>
{/if}

<div class="space-y-4">
	<Card class="max-w-none">
		<!-- Header with title and save button -->
		<div class="flex items-center justify-between pb-4">
			<div>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Skills bearbeiten</h2>
				<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
					Hier kannst du die einzelnen Skills bearbeiten. Achte aber darauf, dass bereits verwendete Skills zu löschen zu Datenverlust führt. <b
				>Sei vorsichtig!</b
				>
				</p>
			</div>

			<div class="flex gap-2 ms-4 mb-4" style="text-wrap: nowrap">
				<SkillUploadButton on:skillsUploaded={handleSkillsUploaded} />

				<Button color="green" on:click={handleAddSkill}>
					<PlusOutline class="w-4 h-4 mr-2" />
					Skill hinzufügen
				</Button>

				{#if !isDeleteMode}
					<Button color="red" on:click={toggleDeleteMode}>
						<TrashBinOutline class="w-4 h-4 mr-2" />
						Mehrere löschen
					</Button>
				{:else}
					<Button color="red" on:click={handleBulkDeleteClick} disabled={selectedSkillIds.size === 0}>
						<TrashBinOutline class="w-4 h-4 mr-2" />
						Ausgewählte löschen ({selectedSkillIds.size})
					</Button>
					<Button color="gray" on:click={toggleDeleteMode}>
						<CloseOutline class="w-4 h-4 mr-2" />
						Abbrechen
					</Button>
				{/if}
			</div>
		</div>

		<hr class="pb-6" />


		{#if skills.length > 0 && showTable}
			<Table class="table-fixed select-none text-center" hoverable={!isDeleteMode} shadow striped={true}>
				<caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
					<div class="flex items-center justify-between">
						<div>
							<span>Skills</span>
							<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
								{#if isDeleteMode}
									Wähle die Skills aus, die du löschen möchtest.
								{:else}
									Hier sind alle auswählbaren Skills aufgelistet. Du kannst sie mit einem <b>Doppelklick</b> bearbeiten.
								{/if}
							</p>
						</div>
						<div class="flex items-center">
							<Label for="categoryFilter" class="mr-2">Filtern:</Label>
							<Select
								id="categoryFilter"
								items={[{ name: 'Alle Kategorien', value: 'all' }, ...departments]}
								class="w-48"
								size="sm"
								bind:value={selectedDepartment}
							/>
						</div>
					</div>
				</caption>
				<TableHead class="bg-green-200">
					{#if isDeleteMode}
						<TableHeadCell class="w-[5%] max-w-[5%]">
							<Checkbox
								checked={selectedSkillIds.size === filteredSkills.length && filteredSkills.length > 0}
								on:change={toggleSelectAll}
							/>
						</TableHeadCell>
					{/if}
					<TableHeadCell sort={(a: Skill, b: Skill) => a.name.localeCompare(b.name)} class="w-[15%] max-w-[15%]">Name</TableHeadCell>
					<TableHeadCell sort={(a: Skill, b: Skill) => a.department.localeCompare(b.department)} defaultSort class="w-[15%] max-w-[15%]">
						Abteilung
					</TableHeadCell>
					<TableHeadCell sort={(a: Skill, b: Skill) => a.category.localeCompare(b.category)} defaultDirection="desc" class="w-[15%] max-w-[15%]">
						Kategorie
					</TableHeadCell>
					<TableHeadCell
						sort={(a: Skill, b: Skill) => {
							const templateA = SkillsetService.getSkillsetTemplate(a.templateId);
							const templateB = SkillsetService.getSkillsetTemplate(b.templateId);
							return templateA.name.localeCompare(templateB.name);
						}}
						class="w-[10%] max-w-[10%]"
					>
						Skillset
					</TableHeadCell>
					<TableHeadCell class="w-[45%] max-w-[45%]">Beschreibung</TableHeadCell>
				</TableHead>
				<TableBody tableBodyClass="divide-y">
					{#each filteredSkills as item}
						<TableBodyRow
							on:dblclick={() => handleDoubleClick(item)}
							class={isDeleteMode ? 'cursor-pointer' : 'hover:bg-primary-100'}
							on:click={() => isDeleteMode && item.id && toggleSkillSelection(item.id)}
						>
							{#if isDeleteMode}
								<TableBodyCell class="w-[5%] max-w-[5%]">
									<Checkbox
										checked={item.id ? selectedSkillIds.has(item.id) : false}
										on:change={() => item.id && toggleSkillSelection(item.id)}
									/>
								</TableBodyCell>
							{/if}
							<TableBodyCell class="w-[15%] max-w-[15%] truncate whitespace-normal text-left">
								{item.name}
							</TableBodyCell>
							<TableBodyCell class="w-[15%] max-w-[15%] truncate whitespace-normal">
								<Badge style="background-color: {getDepartmentColor(item.department)}; padding: 2px 8px; border-radius: 4px;">
									{item.department}
								</Badge>
							</TableBodyCell>
							<TableBodyCell class="w-[15%] max-w-[15%] truncate whitespace-normal">
								<Badge style="background-color: {getCategoryColor(item.category)}; padding: 2px 8px; border-radius: 4px;">
									{item.category}
								</Badge>
							</TableBodyCell>
							<TableBodyCell class="w-[10%] max-w-[10%] truncate whitespace-normal text-left">
								{SkillsetService.getSkillsetTemplate(item.templateId).name || 'Fehler'}
							</TableBodyCell>
							<TableBodyCell class="w-[45%] max-w-[45%] whitespace-normal text-left">
								{item.description}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>

		{/if}
	</Card>
</div>

<SkillEditModal
	skill={selectedSkill}
	bind:open={modalOpen}
	{departments}
	{templates}
	{categoriesByDepartment}
	onSave={handleSave}
	{onDelete}
	onCancel={() => (modalOpen = false)}
/>
