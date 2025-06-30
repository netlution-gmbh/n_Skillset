<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Skill } from '$lib/types/skills';
	import { Button, Modal } from 'flowbite-svelte';
	import { CheckOutline, CloseOutline, FileOutline, UploadOutline } from 'flowbite-svelte-icons';
	import { SkillService } from '$lib/services/skillService';

	const dispatch = createEventDispatcher();

	// Constants moved to module scope for better performance
	const REQUIRED_COLUMNS = ['Unit', 'Department', 'Category', 'Skill Name', 'Skill Description', 'Skillset'] as const;
	const CSV_MIME_TYPE = 'text/csv';
	const MAX_PREVIEW_ROWS = 100; // Limit preview for better performance

	let showModal = false;
	let fileInput: HTMLInputElement;
	let previewData: Skill[] = [];
	let validationErrors: string[] = [];
	let isProcessing = false;

	// Memoized computed values
	$: hasErrors = validationErrors.length > 0;
	$: hasPreviewData = previewData.length > 0;
	$: canSave = hasPreviewData && !hasErrors && !isProcessing;

	function openModal() {
		showModal = true;
		resetState();
	}

	function closeModal() {
		showModal = false;
		resetState();
	}

	function resetState() {
		previewData = [];
		validationErrors = [];
		isProcessing = false;
		if (fileInput) fileInput.value = '';
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (file.type !== CSV_MIME_TYPE && !file.name.toLowerCase().endsWith('.csv')) {
			validationErrors = ['Please select a valid CSV file'];
			return;
		}

		processCSV(file);
	}

	async function processCSV(file: File) {
		isProcessing = true;
		validationErrors = [];

		try {
			const csvText = await file.text(); // More modern than FileReader
			const { data, errors } = parseCSV(csvText);

			validationErrors = errors;
			previewData = errors.length > 0 ? [] : data.slice(0, MAX_PREVIEW_ROWS);
		} catch (error) {
			validationErrors = [`Error processing CSV file: ${(error as Error).message}`];
			previewData = [];
		} finally {
			isProcessing = false;
		}
	}

	function parseCSV(csvText: string): { data: Skill[], errors: string[] } {
		const lines = csvText.trim().split('\n');
		const errors: string[] = [];

		if (lines.length < 2) {
			return {
				data: [],
				errors: ['CSV file must contain at least a header row and one data row']
			};
		}

		// Parse and validate header
		const header = parseCSVRow(lines[0]).map(col => col.trim());
		const missingColumns = REQUIRED_COLUMNS.filter(col => !header.includes(col));

		if (missingColumns.length > 0) {
			return {
				data: [],
				errors: [`Missing required columns: ${missingColumns.join(', ')}`]
			};
		}

		// Create column index map for faster lookup
		const columnIndexMap = new Map(header.map((col, index) => [col, index]));
		const skills: Skill[] = [];

		// Process data rows with early validation
		for (let i = 1; i < lines.length; i++) {
			try {
				const skill = parseSkillRow(lines[i], columnIndexMap, i + 1);
				if (skill.errors.length > 0) {
					errors.push(...skill.errors);
					continue;
				}
				skills.push(skill.data);
			} catch (error) {
				errors.push(`Row ${i + 1}: ${(error as Error).message}`);
			}
		}

		return { data: skills, errors };
	}

	function parseSkillRow(
		row: string,
		columnMap: Map<string, number>,
		rowNumber: number
	): { data: Skill; errors: string[] } {
		const parsedRow = parseCSVRow(row);
		const errors: string[] = [];

		// Extract values using column map
		const getValue = (column: string): string => {
			const index = columnMap.get(column);
			return index !== undefined ? (parsedRow[index] || '').trim() : '';
		};

		// Validate required fields
		const missingFields = REQUIRED_COLUMNS.filter(col => !getValue(col));
		if (missingFields.length > 0) {
			errors.push(`Row ${rowNumber}: Missing values for ${missingFields.join(', ')}`);
		}

		const skill: Skill = {
			name: getValue('Skill Name'),
			description: getValue('Skill Description'),
			department: getValue('Department'),
			category: getValue('Category'),
			unit: getValue('Unit'),
			templateId: getValue('Skillset'),
		};

		return { data: skill, errors };
	}

	// Optimized CSV row parser with better quote handling
	function parseCSVRow(row: string): string[] {
		const result: string[] = [];
		const chars = row.split('');
		let current = '';
		let inQuotes = false;
		let i = 0;

		while (i < chars.length) {
			const char = chars[i];

			if (char === '"') {
				if (inQuotes && chars[i + 1] === '"') {
					current += '"';
					i += 2; // Skip both quotes
					continue;
				}
				inQuotes = !inQuotes;
			} else if (char === ',' && !inQuotes) {
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
			i++;
		}

		result.push(current.trim());
		return result;
	}

	async function saveSkills() {
		if (!canSave) return;

		isProcessing = true;
		try {
			await SkillService.createSkills(previewData);
			dispatch('skillsUploaded', { count: previewData.length });
			closeModal();
		} catch (error) {
			validationErrors = [`Error saving skills: ${(error as Error).message}`];
		} finally {
			isProcessing = false;
		}
	}
</script>

<Button class="flex items-center gap-2" color="primary" on:click={openModal}>
	<UploadOutline class="w-4 h-4" />
	Upload CSV
</Button>

<Modal bind:open={showModal} size="xl" title="Upload Skills from CSV">
	<div class="space-y-6">
		<!-- File Upload Section -->
		<div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
			<div class="text-center">
				<FileOutline class="mx-auto h-12 w-12 text-gray-400" />
				<div class="mt-2">
					<label class="cursor-pointer" for="csv-upload">
						<span class="mt-2 block text-sm font-medium text-gray-900">
							Choose CSV file or drag and drop
						</span>
						<span class="text-xs text-gray-500">
							Required columns: {REQUIRED_COLUMNS.join(', ')}
						</span>
					</label>
					<input
						accept=".csv"
						bind:this={fileInput}
						class="hidden"
						id="csv-upload"
						on:change={handleFileSelect}
						type="file"
					/>
				</div>
			</div>
		</div>

		<!-- Validation Errors -->
		{#if hasErrors}
			<div class="bg-red-50 border border-red-200 rounded-md p-4">
				<div class="flex">
					<CloseOutline class="h-5 w-5 text-red-400" />
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Validation Errors</h3>
						<div class="mt-2 text-sm text-red-700">
							<ul class="list-disc pl-5 space-y-1">
								{#each validationErrors as error}
									<li>{error}</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Preview Section -->
		{#if hasPreviewData}
			<div class="bg-green-50 border border-green-200 rounded-md p-4">
				<div class="flex items-center">
					<CheckOutline class="h-5 w-5 text-green-400" />
					<div class="ml-3">
						<h3 class="text-sm font-medium text-green-800">
							Preview: {previewData.length} skills ready to import
							{#if previewData.length === MAX_PREVIEW_ROWS}
								<span class="text-xs">(showing first {MAX_PREVIEW_ROWS} rows)</span>
							{/if}
						</h3>
					</div>
				</div>
			</div>

			<div class="max-h-96 overflow-auto border rounded-lg">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50 sticky top-0">
					<tr>
						{#each ['Unit', 'Department', 'Category', 'Skill Name', 'Description', 'Skillset'] as header}
							<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								{header}
							</th>
						{/each}
					</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
					{#each previewData as skill}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-2 text-sm text-gray-900">{skill.unit}</td>
							<td class="px-4 py-2 text-sm text-gray-900">{skill.department}</td>
							<td class="px-4 py-2 text-sm text-gray-900">{skill.category}</td>
							<td class="px-4 py-2 text-sm font-medium text-gray-900">{skill.name}</td>
							<td class="px-4 py-2 text-sm text-gray-900 max-w-xs truncate" title={skill.description}>
								{skill.description}
							</td>
							<td class="px-4 py-2 text-sm text-gray-900 max-w-xs truncate" title={skill.templateId}>
								{skill.templateId}
							</td>
						</tr>
					{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Processing Indicator -->
		{#if isProcessing}
			<div class="flex justify-center items-center py-4">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
				<span class="ml-2 text-sm text-gray-600">Processing...</span>
			</div>
		{/if}
	</div>

	<svelte:fragment slot="footer">
		<div class="flex justify-end space-x-2">
			<Button color="alternative" disabled={isProcessing} on:click={closeModal}>
				Cancel
			</Button>
			<Button color="primary" disabled={!canSave} on:click={saveSkills}>
				{isProcessing ? 'Saving...' : `Import ${previewData.length} Skills`}
			</Button>
		</div>
	</svelte:fragment>
</Modal>
