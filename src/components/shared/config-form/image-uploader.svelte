<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { UploadOutline } from 'flowbite-svelte-icons';

	export let value: string = ""

	// Function to resize image and convert to base64
	function resizeImage(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				reject(new Error('Could not get canvas context'));
				return;
			}

			img.onload = () => {
				// Calculate new dimensions maintaining aspect ratio
				const targetHeight = 48;
				const aspectRatio = img.width / img.height;
				const targetWidth = Math.round(targetHeight * aspectRatio);

				// Set canvas dimensions
				canvas.width = targetWidth;
				canvas.height = targetHeight;

				// Draw resized image
				ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

				// Convert to base64
				const base64 = canvas.toDataURL('image/png');
				resolve(base64);
			};

			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = URL.createObjectURL(file);
		});
	}

	// Handle file selection
	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('Please select a valid image file');
			return;
		}

		try {
			value = await resizeImage(file);

			// Clear the input for potential re-upload of same file
			target.value = '';
		} catch (error) {
			console.error('Error processing image:', error);
			alert('Error processing image. Please try again.');
		}
	}

	// Get current logo from store
</script>

<div class="flex items-center gap-4">
	<!-- Upload Button -->
	<div>
		<input
			accept="image/*"
			class="hidden"
			id="logo-upload"
			on:change={handleFileSelect}
			type="file"
		/>
		<Button
			color="primary"
			on:click={() => document.getElementById('logo-upload')?.click()}
			size="sm"
		>
			<UploadOutline class="w-4 h-4 me-2" />
			Upload Logo
		</Button>
	</div>

	<!-- Image Display -->
	{#if value}
		<div class="flex items-center">
			<img
				src={value}
				alt="Company Logo"
				class="h-12 object-contain border border-gray-200 rounded"
			/>
		</div>
	{:else}
		<div class="flex items-center justify-center w-16 h-12 bg-gray-100 border border-gray-200 rounded">
			<span class="text-xs text-gray-400">No logo</span>
		</div>
	{/if}
</div>
