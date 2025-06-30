<script lang="ts">
	import { Blockquote, Card, Heading, P } from 'flowbite-svelte';
	import { authStore } from '$lib/stores/authStore';
	import { getDepartmentColor } from '$lib/helpers/colorHelpers';
	import { UserSkillService } from '$lib/services/userSkillService';
	import { onMount } from 'svelte';
	import { BrainOutline, RocketOutline } from 'flowbite-svelte-icons';
	import MessageBox from '../layout/message-box.svelte';
	import { hasSkillExperience } from '$lib/helpers/skillHelpers';
	import { MessageType } from '$lib/types/message';
	import { LoadingService } from '$lib/services/loadingService';
	import { browser } from '$app/environment';
	import NewsSlider from './components/news-slider.svelte';
	import { ConfigService } from '$lib/services/configService';

	let isAuthenticated: boolean;
	let userName: string;
	let accentColor: string;
	let skillCount = 0;
	let experienceCount = 0;
	LoadingService.showLoading();

	$: if ($authStore && $authStore.userId && isAuthenticated) {
		loadUserData($authStore.userId);
	}
	authStore.subscribe(state => {
		isAuthenticated = state.isAuthenticated;
		if((browser && !localStorage.getItem('auth')) ) {
			LoadingService.hideLoading();
		}

		userName = state.userName.split(',')[1]?.trim() || state.userName;
		accentColor = getDepartmentColor(state.department || '');
	});


	// Function to load user data
	async function loadUserData(userId) {
		LoadingService.showLoading();

		try {
			const userSkills = await UserSkillService.getAllUserSkills(userId);
			skillCount = userSkills.length;
			experienceCount = userSkills.filter(u => hasSkillExperience(u)).length;
		} catch (error) {
			console.error('Error loading user skills:', error);
		} finally {
			LoadingService.hideLoading();
		}
	}

	onMount(() => {
		// If already authenticated on mount, load data
		if ($authStore.userId && isAuthenticated) {
			loadUserData($authStore.userId);
		}
	});
</script>
<div class="p-4 lg:p-8">
	{#if isAuthenticated}
		<div class="flex flex-row gap-4">
			<div>
				<!-- First Row: Welcome and Stats -->
				<div class="flex flex-1 gap-4 mb-6">
					<!-- Welcome Message -->
					<div class="flex w-full ">
						<Card class="flex max-h-fit items-start flex-1 gap-4 max-w-none flex-row"
									style="border-left: 50px solid {accentColor}">
							<div>
								<Heading tag="h2" class="mb-4">Hallo, {userName} 👋</Heading>
								<P>Du und deine Skills sind essentiell für { ConfigService.getValue('frontend.company_name')}. Danke, dass du dabei bist!</P>
							</div>
							<div class="flex gap-4 flex-1 justify-end">
								<div class="flex-1   p-4 rounded-lg bg-primary-50  max-w-[150px]">
									<div class="flex-row flex ">
										<BrainOutline class="w-8 h-8 mx-auto mb-2 text-primary-700" />
										<Heading tag="h3" class="text-3xl ms-2 font-bold text-primary-700">{skillCount}</Heading>
									</div>
									<P>Skills</P>
								</div>
								<div class="flex-1 p-4 rounded-lg bg-primary-50  max-w-[150px]">
									<div class="flex-row flex">
										<RocketOutline class="w-8 h-8 mx-auto mb-2 text-primary-700" />
										<Heading tag="h3" class="text-3xl ms-2 font-bold text-primary-700">{experienceCount}</Heading>
									</div>
									<P>Erfahrungen</P>
								</div>
							</div>
						</Card>
					</div>

				</div>

				<!-- Second Row: App Features -->
				<div class="flex flex-wrap gap-4 mb-6">
					<Card class="flex-1 max-w-none hover:scale-102 transition-transform min-w-[300px]">
						<div class="flex flex-row gap-4">
							<BrainOutline class="w-10 h-10 mb-4 text-primary-700" />
							<Heading tag="h3" class="mb-4">Meine Skills</Heading>
						</div>
						<P>
							In "Meine Skills" kannst du all deine technischen und fachlichen Kompetenzen erfassen. Hier
							dokumentierst du, welche Technologien, Tools und Methoden du beherrschst.
							<br> <br>
						<Blockquote> Was kann ich?</Blockquote>
						<br>Jeder Skill kann mit
						<b>Erfahrungen</b> versehen werden.
						</P>
					</Card>

					<Card class="flex-1 max-w-none hover:scale-102 transition-transform min-w-[300px]">
						<div class="flex flex-row gap-4">
							<RocketOutline class="w-10 h-10 mb-4 text-primary-700" />
							<Heading tag="h3" class="mb-4">Meine Erfahrungen</Heading>
						</div>
						<P>Der Bereich "Meine Erfahrungen" ermöglicht es dir, deine praktischen Projekterfahrungen zu dokumentieren.
							Hier kannst du festhalten, in wie lange du deine Fähigkeiten eingesetzt hast, wie umfassend die sind und
							welche konkreten
							Erfolge du erzielt hast.
							<br> <br>
						<Blockquote> Wie gut kann ich etwas?</Blockquote>
						<br>Du kannst dabei angeben, ob deine Erfahrung eher
						<b>operativ</b>, <b>architektonisch</b> oder <b>strategisch</b> ausgeprägt ist.</P>
					</Card>
				</div>
			</div>
			<div class="flex min-w-[300px]">
				<NewsSlider />
			</div>
		</div>


	{:else}
		<MessageBox message="{{
	text: 'Bitte melde dich an, um die volle Funktionalität zu nutzen.',
		type: MessageType.Information,
		title: 'Willkommen',
		}}"></MessageBox>

	{/if}
</div>
<style>
    :global(.hover\:scale-102:hover) {
        transform: scale(1.02);
    }
</style>
