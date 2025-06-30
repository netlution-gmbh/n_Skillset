<script lang="ts">
	import type { ConfigElement } from '$lib/types/config-element';
	import { Input, Label } from 'flowbite-svelte';
	import ImageUploader from './image-uploader.svelte';

	export let configElements: ConfigElement[];
	export let configValues: Record<string, string>;

</script>
{#each configElements as field}
	<div class="mb-6">
		<Label for={field.key} class="mb-2">{field.metadata.label}</Label>

		{#if field.metadata.type === 'password'}
			<Input
				id={field.key}
				type="password"
				bind:value={ configValues[field.key]}
				placeholder={field.metadata.label}
			/>
		{:else if field.metadata.type === 'url'}
			<Input
				id={field.key}
				type="url"
				bind:value={ configValues[field.key]}
				placeholder={field.metadata.label}
			/>
		{:else if field.metadata.type === 'image'}
			<ImageUploader bind:value={configValues[field.key]}></ImageUploader>
		{:else}
			<Input
				id={field.key}
				type="text"
				bind:value={configValues[field.key]}
				placeholder={field.metadata.label}
			/>
		{/if}

		{#if field.metadata.description}
			<p class="mt-1 text-sm text-gray-500">{field.metadata.description}</p>
		{/if}
	</div>
{/each}
