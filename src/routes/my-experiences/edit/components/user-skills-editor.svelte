<script lang="ts">
	import CustomRange from '../../../../components/shared/custom-inputs/custom-range.svelte';
	import CustomNumber from '../../../../components/shared/custom-inputs/custom-number.svelte';
	import SkillLevelCard from './skill-level-card.svelte';
	import SkillTagsEditor from './skill-tags-editor.svelte';
	import { Alert, TabItem, Tabs } from 'flowbite-svelte';
	import { EditorService } from '../services/editorService';
	import { editorStore } from '../stores/editorStore';
	import { DribbbleSolid } from 'flowbite-svelte-icons';

	$: tabsKey = $editorStore.currentIndex;
</script>

<div class="grid grid-cols-[2fr_3fr] gap-8">
	<div class="col-span-1">
		{#if $editorStore.error}
			<Alert color="red">
				<span class="font-medium">Error!</span> {$editorStore.error}
			</Alert>
		{:else if $editorStore.template}
			{#key tabsKey}

			<Tabs contentClass="mb-4">
				{#each $editorStore.template.levels as level, i}
					<TabItem open={i === 0} title={level.displayName}>
						<SkillLevelCard title={level.displayName} description={level.description}>
							{#each level.parameters as param}
								{#if param.type === 'range'}
									<CustomRange
										label={param.displayName}
										value={EditorService.getSkillsetValue(level.name, param.name)}
										on:change={(e) => EditorService.updateSkillsetValue(level.name, param.name, e.detail)}
										range={param.possibleValues}
									/>
								{:else if param.type === 'number'}
									<CustomNumber
										id={`${level.name}-${param.name}`}
										label={param.displayName}
										value={EditorService.getSkillsetValue(level.name, param.name)}
										on:change={(e) => EditorService.updateSkillsetValue(level.name, param.name, e.detail)}
									/>
								{/if}
							{/each}
						</SkillLevelCard>
					</TabItem>
				{/each}
			</Tabs>
			{/key}
		{:else}
			<Alert color="blue">
				<span class="font-medium">Loading skillset...</span>
			</Alert>
		{/if}
	</div>

	<!-- Right section -->
	<div>
		<Tabs contentClass="mt-2">
			<TabItem open>
				<div class="flex items-center gap-2" slot="title">
					<DribbbleSolid size="md" />
					Spezifische Kenntnisse
				</div>
				<SkillTagsEditor />
			</TabItem>
		</Tabs>
	</div>
</div>
