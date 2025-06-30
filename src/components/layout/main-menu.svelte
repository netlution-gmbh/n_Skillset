<script lang="ts">
	import {
		Avatar,
		Button,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem,
		Navbar,
		NavBrand,
		NavLi,
		NavUl
	} from 'flowbite-svelte';
	import { authStore } from '$lib/stores/authStore';
	import { AwardOutline, BrainOutline, HomeOutline, RocketOutline } from 'flowbite-svelte-icons';
	import { AuthService } from '$lib/services/authService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ConfigService } from '$lib/services/configService';

	$: activeUrl = $page.url.pathname;

	let isOpen = false;

	const toManagerArea = () => {
		isOpen = false;
		goto('/manager');
	}
	const toAdminArea = () => {
		isOpen = false;
		goto('/admin');
	};
</script>

<Navbar class="bg-primary-700 text-white" shadow>
	<NavBrand href="/">
		<img alt="Company Logo" class="me-3 h-6 sm:h-9" src="{ConfigService.getValue('frontend.company_logo') || '/images/logo.svg'}"  />
		<span
			class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">{ConfigService.getValue('frontend.app_name')}</span>
	</NavBrand>

	<div class="flex items-center md:order-2 ">
		{#if $authStore.isAuthenticated}
			<Avatar id="avatar-menu" src="{$authStore.profileImage}" class="cursor-pointer" />

			<Dropdown placement="bottom"  bind:open={isOpen} triggeredBy="#avatar-menu">
				<DropdownHeader>
					<span class="block text-sm">{$authStore.userName}</span>
					<span class="block text-sm">{$authStore.userEmail}</span>
				</DropdownHeader>
				{#if $authStore.isManager}
					<DropdownItem on:click={toManagerArea}>Teamlead Bereich</DropdownItem>
					<DropdownDivider></DropdownDivider>
				{/if}
				{#if $authStore.isAdmin}
					<DropdownItem on:click={toAdminArea}>Admin Bereich</DropdownItem>
					<DropdownDivider></DropdownDivider>
				{/if}
				<DropdownItem on:click={AuthService.logout}>Ausloggen</DropdownItem>
			</Dropdown>
		{:else}
			<Button on:click={AuthService.login}>Einloggen</Button>
		{/if}
	</div>

	{#if $authStore.isAuthenticated}
		<NavUl {activeUrl} color="white">
			<NavLi href="/" class="flex items-center" activeClass="text-white" nonActiveClass="text-gray-400">
				<HomeOutline class="w-6 h-6 me-2"></HomeOutline>
				Dashboard
			</NavLi>
			<NavLi href="/my-skills" class="flex items-center" activeClass="text-white" nonActiveClass="text-gray-400">
				<BrainOutline class="w-6 h-6 me-2"></BrainOutline>
				Meine Skills
			</NavLi>
			<NavLi href="/my-experiences" class="flex items-center" activeClass="text-white" nonActiveClass="text-gray-400">
				<RocketOutline class="w-6 h-6 me-2"></RocketOutline>
				Meine Erfahrungen
			</NavLi>
			<NavLi href="/my-certificates" class="flex items-center" activeClass="text-white" nonActiveClass="text-gray-400">
				<AwardOutline class="w-6 h-6 me-2"></AwardOutline>
				Meine Zertifikate
			</NavLi>
		</NavUl>
	{/if}
</Navbar>
