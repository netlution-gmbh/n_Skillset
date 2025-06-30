<script lang="ts">
	import PageHeader from '../../components/layout/page-header.svelte';
	import SkillOverviewTable from './components/skill-overview-table/skill-overview-table.svelte';
	import { TabItem, Tabs } from 'flowbite-svelte';
	import ConfigOverview from './components/config-overview/config-overview.svelte';
</script>

<PageHeader description="With great power.. und so weiter." title="Admin Bereich"></PageHeader>

<div class="flex gap-8 w-full">
	<Tabs class="flex-col space-x-0 space-y-4 " contentClass="w-full pb-5" tabStyle="pill">
		<TabItem class="w-full" open>
			<div class="font-medium w-[200px]" slot="title">Konfiguration</div>
			<ConfigOverview></ConfigOverview>
		</TabItem>
		<TabItem>
			<div class="font-medium w-[200px]" slot="title">Skills bearbeiten</div>
			<SkillOverviewTable></SkillOverviewTable>
		</TabItem>
	</Tabs>
</div>
