<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { MessageProps } from '$lib/types/message';
	import { MessageType } from '$lib/types/message';
	import { ExclamationCircleSolid, InfoCircleSolid } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';

	export let message: MessageProps;
	export let showDelay = 1000;

	let visible = false;
	let delayTimeout: ReturnType<typeof setTimeout>;

	const getIcon = (type: MessageType) => {
		switch (type) {
			case MessageType.Information:
				return InfoCircleSolid;
			case MessageType.Warning:
				return ExclamationCircleSolid;
			case MessageType.Error:
				return ExclamationCircleSolid;
		}
	};

	const getColorClass = (type: MessageType) => {
		switch (type) {
			case MessageType.Information:
				return 'bg-blue-50 text-blue-800';
			case MessageType.Warning:
				return 'bg-yellow-50 text-yellow-800';
			case MessageType.Error:
				return 'bg-red-50 text-red-800';
		}
	};

	onMount(() => {
		// Use the isVisible prop from message if provided, otherwise use the delay logic
		if (message.isVisible !== undefined) {
			visible = message.isVisible;
		} else if (showDelay > 0) {
			delayTimeout = setTimeout(() => {
				visible = true;
			}, showDelay);
		} else {
			visible = true;
		}
	});

	onDestroy(() => {
		if (delayTimeout) {
			clearTimeout(delayTimeout);
		}
	});
</script>

{#if visible}
	<div class="fixed inset-0 flex items-center justify-center px-4 max-w-[460px] m-auto"
	     style="top: 64px;"
	     transition:fade={{ duration: 200 }}>
		<div class="max-w-md w-full p-6 rounded-lg shadow-lg {getColorClass(message.type)}">
			<div class="flex items-center gap-3">
				<svelte:component size="xl" this={getIcon(message.type)} />
				<h2 class="text-xl font-semibold">{message.title}</h2>
			</div>
			<p class="mt-4 mb-6">{message.text}</p>
			<div class="flex justify-end">
				<slot />
			</div>
		</div>
	</div>
{/if}
