<script lang="ts">
	import { Button, Footer, FooterLink, FooterLinkGroup } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { ConfigService } from '$lib/services/configService.js';
	import { goto } from '$app/navigation';

	let helpURL = "";
	let bugReportURL = "";
	let contactURL = "";


	onMount(() => {
		helpURL = ConfigService.getValue('frontend.urls.help');
		bugReportURL = ConfigService.getValue('frontend.urls.bug_report');
		contactURL = ConfigService.getValue('frontend.urls.contact');
	})

</script>

<Footer class="bg-primary-700 text-white" footerType="logo" style="border-radius: 0px!important;">
	<div class="mx-auto flex flex-wrap justify-between items-center container">
		<span>Powered by <a href="https://netlution.de">n_Skillset</a></span>
		<FooterLinkGroup ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-300 dark:text-gray-400 sm:mt-0 ">
			<FooterLink class="text-white" href="{helpURL}" target="_blank">Hilfe</FooterLink>
			<FooterLink href="{contactURL}" target="_blank">Kontakt</FooterLink>
			<Button class="bg-transparent border-gray-50 text-gray-50" color="light" on:click="{() => goto(bugReportURL)}" outline
							target="_blank">Fehler
				melden
			</Button>
		</FooterLinkGroup>
	</div>
</Footer>

