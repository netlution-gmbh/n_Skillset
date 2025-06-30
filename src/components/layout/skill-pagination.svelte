<script lang="ts">
	import type { UserSkill } from '$lib/types/skills';
	import { page } from '$app/stores';
	import { Pagination, Search, Select } from 'flowbite-svelte';
	import { ArrowLeftOutline, ArrowRightOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	export let userSkills: UserSkill[] = [];
	let searchQuery = '';
	let selectedDepartment = 'all';
	let itemsPerPage = 24;

	// Get current page from URL
	$: activeUrl = $page.url.searchParams.get('page') || '1';
	$: currentPage = parseInt(activeUrl);

	// Sample user skills - replace with your actual data

	// Extract unique departments from userSkills
	$: departments = [
		{ value: 'all', name: 'Alle Abteilungen' },
		...Array.from(new Set(userSkills.map(userSkill => userSkill.skill.department)))
			.map(dept => ({ value: dept, name: dept }))
	];

	const itemsPerPageOptions = [
		{ value: 24, name: '24 Einträge' },
		{ value: 48, name: '48 Einträge' },
		{ value: 96, name: '96 Einträge' }
	];

	let filteredSkills = [];

	$: {
		filteredSkills = userSkills.filter(userSkill => {
			const matchesSearch = userSkill.skill.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesDepartment = selectedDepartment === 'all' || userSkill.skill.department === selectedDepartment;
			return matchesSearch && matchesDepartment;
		});
	}

	$: totalPages = Math.ceil(filteredSkills.length / itemsPerPage);

	// Generate pagination pages array
	$: pages = Array.from({ length: totalPages }, (_, i) => ({
		name: i + 1,
		href: `?page=${i + 1}`,
		active: currentPage === i + 1
	}));

	// Get paginated skills
	$: paginatedItems = filteredSkills.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Update URL when page changes
	function handlePageChange(pageNum: number) {
		// Use goto instead of pushState to properly update the $page store
		goto(`?page=${pageNum}`, { keepFocus: true, noScroll: true, replaceState: false });
	}

	function goToNextPage() {
		if (currentPage < totalPages) {
			handlePageChange(currentPage + 1);
		}
	}

	function goToPrevPage() {
		if (currentPage > 1) {
			handlePageChange(currentPage - 1);
		}
	}
</script>
<div class="container mx-auto p-4 flex flex-col h-full">
	<!-- Keep filters at natural height -->
	<div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
		<div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
			<Select
				bind:value={selectedDepartment}
				class="w-full md:w-48"
				items={departments}
			/>

			<Search
				bind:value={searchQuery}
				placeholder="Skills durchsuchen..."
				size="md"
			/>
		</div>

		<Select
			bind:value={itemsPerPage}
			class="w-full md:w-36"
			items={itemsPerPageOptions}
		/>
	</div>

	<!-- Grid takes available space without growing cards -->
	<div
		class="grid grid-cols-1 p-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-grow overflow-y-auto justify-items-center">
		<slot {paginatedItems} />
	</div>

	<!-- Pagination stays at bottom -->
	<div class="flex justify-center mt-auto py-6">
		<Pagination
			lang="de"
			on:page={(e) => handlePageChange(e.detail)}
			{pages}
			showControls
		>
			<button type="button" slot="prev" class="flex items-center gap-2 cursor-pointer" on:click={goToPrevPage}>
				<ArrowLeftOutline class="w-3 h-3 me-1" />
				Zurück
			</button>
			<button type="button" slot="next" class="flex items-center gap-2 cursor-pointer" on:click={goToNextPage}>
				Weiter
				<ArrowRightOutline class="w-3 h-3 ms-1" />
			</button>
		</Pagination>
	</div>
</div>
