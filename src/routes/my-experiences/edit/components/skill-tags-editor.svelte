<script lang="ts">
	import { Button, Card, Label } from 'flowbite-svelte';
	import CustomRange from '../../../../components/shared/custom-inputs/custom-range.svelte';
	import AutocompleteInput from '../../../../components/shared/custom-inputs/autocomplete-input.svelte';
	import { EditorService } from '../services/editorService';
	import { editorStore } from '../stores/editorStore';
	import type { SkillTag } from '$lib/types/skills';

	// Reactive variables
	$: currentSkill = $editorStore.currentSkill;
	$: tags = currentSkill?.tags || [];

	/**
	 * Handle level change for a specific tag
	 */
	function handleLevelChange(tag: SkillTag, newLevel: number): void {
		tag.level = newLevel;
		updateTagsInStore();
	}

	/**
	 * Handle name change for a specific tag
	 */
	function updateTagName(tag: SkillTag, newName: string): void {
		tag.name = newName;
		updateTagsInStore();
	}

	/**
	 * Add a new empty tag
	 */
	function addTag(): void {
		if (!currentSkill) return;

		const updatedTags = [...tags, createEmptyTag()];
		EditorService.updateTags(updatedTags);
	}

	/**
	 * Remove a tag by index
	 */
	function removeTag(index: number): void {
		if (!currentSkill) return;

		const updatedTags = tags.filter((_, i) => i !== index);
		EditorService.updateTags(updatedTags);
	}

	/**
	 * Update tags in the store
	 */
	function updateTagsInStore(): void {
		if (!currentSkill) return;

		EditorService.updateTags([...tags]);
	}

	/**
	 * Create an empty tag
	 */
	function createEmptyTag(): SkillTag {
		return { name: '', level: 1 };
	}
</script>

<Card class="w-full max-w-full">
	<div class="mb-4">
		<h6 class="text-lg font-semibold text-gray-900 dark:text-white">
			Spezifische Kenntnisse
		</h6>
		<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
			Fügen Sie spezifische Technologien, Tools oder Frameworks hinzu, die zu diesem Skill gehören.
		</p>
	</div>

	<div class="space-y-4">
		{#if tags.length > 0}
			{#each tags as tag, index (index)}
				<div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<!-- Tag Name Input -->
					<div class="flex-grow mt-4">
						<Label for="tag-{index}" class="mb-2">
							Spezifische Kenntnis
						</Label>
						<AutocompleteInput
							id="tag-{index}"
							bind:value={tag.name}
							placeholder="z.B. Docker Compose, Kubernetes, Angular..."
						/>
					</div>

					<!-- Level Range -->
					<div class="w-64">
						<CustomRange
							label="Kenntnisstand"
							range={['Anfänger', 'Fortgeschritten', 'Experte']}
							value={tag.level}
							on:change={(e) => handleLevelChange(tag, e.detail)}
						/>
					</div>

					<!-- Remove Button -->
					<Button
						color="red"
						outline
						size="xs"
						class="flex-shrink-0"
						on:click={() => removeTag(index)}
						aria-label="Kenntnis entfernen"
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</Button>
				</div>
			{/each}
		{:else}
			<div class="text-center py-8 text-gray-500 dark:text-gray-400">
				<p class="mb-2">Noch keine spezifischen Kenntnisse hinzugefügt.</p>
				<p class="text-sm">Klicken Sie auf "Kenntnis hinzufügen", um zu beginnen.</p>
			</div>
		{/if}

		<!-- Add Tag Button -->
		<div class="pt-2">
			<Button
				color="light"
				on:click={addTag}
				class="w-full sm:w-auto"
			>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
				Kenntnis hinzufügen
			</Button>
		</div>
	</div>
</Card>
