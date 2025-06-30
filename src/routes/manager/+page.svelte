<script lang="ts">
	import PageHeader from '../../components/layout/page-header.svelte';
	import UserOverviewTable from './components/user-overview-table/user-overview-table.svelte';
</script>

<PageHeader
	description="Hier siehst du eine Übersicht über deine Kollegen und wann diese das letzte Mal ihre Skills aktualisiert haben."
	title="Teamlead Bereich"></PageHeader>

<div class="flex gap-8  w-full">
	<div class="w-full">
		<UserOverviewTable></UserOverviewTable>
	</div>
</div>
