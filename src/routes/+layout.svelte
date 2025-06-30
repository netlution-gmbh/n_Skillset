<script lang="ts">
	import '../app.css';
	import MainMenu from '../components/layout/main-menu.svelte';
	import MainFooter from '../components/layout/main-footer.svelte';
	import { Spinner } from 'flowbite-svelte';
	import { loadingStore } from '$lib/stores/loadingStore';

	let { children,  data } = $props();

	const showHeaderFooter = data.showHeaderFooter;
</script>

<div class="flex flex-col h-screen">
	{#if showHeaderFooter}

	<div class="fixed top-0 left-0 right-0 z-50">
		<MainMenu></MainMenu>
	</div>
	{/if}


	{#if $loadingStore}
		<div class="fixed inset-0 flex items-center justify-center z-50" style="backdrop-filter: blur(5px)">
			<Spinner size="16" />
		</div>
	{/if}

	<main class="flex-1 overflow-y-auto" class:invisible={$loadingStore} class:mb-[106px]={showHeaderFooter} class:mt-[76px]={showHeaderFooter}>
		<div class="container mx-auto p-4 page-container">
			{@render children()}
		</div>
	</main>

	{#if showHeaderFooter}

	<div class="fixed bottom-0 left-0 right-0">
		<MainFooter></MainFooter>
	</div>
	{/if}

</div>

<style>
    .page-container {
        display: flex;
        flex-direction: column;
    }
</style>
