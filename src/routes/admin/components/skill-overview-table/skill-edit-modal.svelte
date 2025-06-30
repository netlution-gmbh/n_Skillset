
<script lang="ts">
	import type { Skill } from '$lib/types/skills';
	import { Alert, Button, Input, Label, Modal, Select, Textarea } from 'flowbite-svelte';
	import { TrashBinOutline } from 'flowbite-svelte-icons';

	interface SelectOption {
		name: string;
		value: string;
	}

	// Props
	export let skill: Skill;
	export let open: boolean = false;
	export let departments: SelectOption[] = [];
	export let templates: SelectOption[] = [];
	export let onSave: (skill: Skill) => Promise<void>;
	export let onDelete: (skill: Skill) => Promise<void>;
	export let onCancel: () => void;
	export let categoriesByDepartment: Record<string, SelectOption[]> = {};

	// Local state
	let editingSkill: Skill = {} as Skill;
	let originalTemplateId: string = '';
	let showDeleteConfirmation: boolean = false;
	let isDeleting: boolean = false;

	// Custom input state
	let isCustomDepartment: boolean = false;
	let isCustomCategory: boolean = false;

	// Computed values
	$: templateChanged = editingSkill?.templateId !== originalTemplateId;
	$: categories = categoriesByDepartment[editingSkill?.department] || [];

	$: departmentOptions = [
		...departments,
		{ name: '+ Neue Abteilung hinzufügen', value: '@addNew' }
	];

	$: categoryOptions = [
		...categories,
		{ name: '+ Neue Kategorie hinzufügen', value: '@addNew' }
	];

	// Initialize editing skill when skill prop changes
	$: if (skill) {
		initializeSkill();
	}

	function initializeSkill(): void {
		editingSkill = { ...skill };
		originalTemplateId = skill.templateId || '';

		// Check if current values are custom
		isCustomDepartment = !departments.some(dept => dept.value === skill.department);
		isCustomCategory = categories.length > 0 && !categories.some(cat => cat.value === skill.category);
	}

	// Handle department changes and update categories
	$: if (editingSkill?.department && !isCustomDepartment) {
		updateCategoryOnDepartmentChange();
	}

	function updateCategoryOnDepartmentChange(): void {
		const newCategories = categoriesByDepartment[editingSkill.department] || [];

		// Only update category if it's not custom and there are categories available
		if (!isCustomCategory && newCategories.length > 0 &&
			!newCategories.some(cat => cat.value === editingSkill.category)) {
			editingSkill.category = newCategories[0].value;
		}
	}

	function handleTemplateChange(event: Event): void {
		editingSkill.templateId = (event.target as HTMLSelectElement).value;
	}

	function handleDepartmentChange(event: CustomEvent<{ value: string }>): void {
		if (event.detail.value === '@addNew') {
			isCustomDepartment = true;
			editingSkill.department = '';
		} else {
			isCustomDepartment = false;
			editingSkill.department = event.detail.value;
		}
	}

	function handleCategoryChange(event: CustomEvent<{ value: string }>): void {
		if (event.detail.value === '@addNew') {
			isCustomCategory = true;
			editingSkill.category = '';
		} else {
			isCustomCategory = false;
			editingSkill.category = event.detail.value;
		}
	}

	function switchBackToDepartmentSelect(): void {
		isCustomDepartment = false;
		if (departments.length > 0) {
			editingSkill.department = departments[0].value;
		}
	}

	function switchBackToCategorySelect(): void {
		isCustomCategory = false;
		if (categories.length > 0) {
			editingSkill.category = categories[0].value;
		}
	}

	async function handleSave(): Promise<void> {
		await onSave(editingSkill);
	}

	function handleDeleteClick(): void {
		showDeleteConfirmation = true;
	}

	async function confirmDelete(): Promise<void> {
		isDeleting = true;
		try {
			await onDelete(editingSkill);
		} finally {
			isDeleting = false;
			showDeleteConfirmation = false;
		}
	}

	function cancelDelete(): void {
		showDeleteConfirmation = false;
	}
</script>

<Modal autoclose={false} bind:open size="lg" title="Skill bearbeiten">
	{#if editingSkill && Object.keys(editingSkill).length > 0}
		<div class="p-6">
			{#if showDeleteConfirmation}
				<DeleteConfirmation
					itemName={editingSkill.name}
					itemType="den Skill"
					onConfirm={confirmDelete}
					onCancel={cancelDelete}
					{isDeleting}
					warningMessage="Sind Sie sicher, dass Sie den Skill &quot;<strong>{editingSkill.name}</strong>&quot; löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden und kann sich auf bestehende Bewertungen auswirken."
				/>
			{:else}
				<form class="space-y-6">
					<div>
						<Label for="name">Name</Label>
						<Input id="name" bind:value={editingSkill.name} />
					</div>

					<div>
						<Label for="department">Abteilung</Label>
						{#if isCustomDepartment}
							<div class="flex gap-2">
								<Input
									id="department"
									bind:value={editingSkill.department}
									placeholder="Neue Abteilung eingeben..."
									class="flex-1"
								/>
								{#if departments.length > 0}
									<Button
										color="gray"
										size="sm"
										on:click={switchBackToDepartmentSelect}
										title="Zurück zur Auswahl"
									>
										Auswahl
									</Button>
								{/if}
							</div>
						{:else}
							<Select
								id="department"
								items={departmentOptions}
								bind:value={editingSkill.department}
								on:change={handleDepartmentChange}
							/>
						{/if}
					</div>

					<div>
						<Label for="category">Kategorie</Label>
						{#if isCustomCategory}
							<div class="flex gap-2">
								<Input
									id="category"
									bind:value={editingSkill.category}
									placeholder="Neue Kategorie eingeben..."
									class="flex-1"
								/>
								{#if categories.length > 0}
									<Button
										color="gray"
										size="sm"
										on:click={switchBackToCategorySelect}
										title="Zurück zur Auswahl"
									>
										Auswahl
									</Button>
								{/if}
							</div>
						{:else}
							<Select
								id="category"
								items={categoryOptions}
								bind:value={editingSkill.category}
								on:change={handleCategoryChange}
							/>
						{/if}
					</div>

					<div>
						<Label for="skillsetTemplate">Skillset Vorlage</Label>
						<Select
							id="skillsetTemplate"
							items={templates}
							value={editingSkill.templateId || 'default'}
							on:change={handleTemplateChange}
						/>
						{#if templateChanged}
							<Alert color="yellow" class="mt-2">
								<span class="font-medium">Achtung!</span> Änderungen am Skillset können bestehende Bewertungsdaten
								ungültig machen. Diese Aktion kann weitreichende Auswirkungen haben.
							</Alert>
						{/if}
					</div>

					<div>
						<Label for="description">Beschreibung</Label>
						<Textarea id="description" bind:value={editingSkill.description} rows={4} />
					</div>
				</form>
			{/if}
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<div class="flex justify-between w-full">
			<div>
				<Button
					class="flex items-center"
					color="red"
					on:click={handleDeleteClick}
					outline
				>
					<TrashBinOutline class="w-4 h-4 mr-2" />
					Löschen
				</Button>
			</div>

			<div class="flex space-x-2">
				<Button color="gray" on:click={onCancel}>Abbrechen</Button>
				<Button color="blue" on:click={handleSave}>Speichern</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>
