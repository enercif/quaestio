<script lang="ts">
	import { resolve } from '$app/paths';
	import AnalyticsRoomOverviewTab from '$lib/components/analytics/room/analytics-room-overview-tab.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { AnalyticsRoom } from '$lib/schemas/analytics.schema';
	import { analyticsSearchParamsSchema } from '$lib/schemas/searchparams/analytics.searchparam.schema';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { useSearchParams } from 'runed/kit';
	import AnalyticsRoomQuestionsTab from './analytics-room-questions-tab.svelte';
	import AnalyticsRoomStudentsTab from './analytics-room-students-tab.svelte';
	import { analyticsRoomContext, AnalyticsRoomState } from './analytics-room.state.svelte';

	interface Props {
		analytics: AnalyticsRoom;
	}

	let { analytics }: Props = $props();

	analyticsRoomContext.set(new AnalyticsRoomState(() => analytics));
	const params = useSearchParams(analyticsSearchParamsSchema);
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" href={resolve('/teacher/analytics/rooms')}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{analytics?.quiz.title ?? 'Raum'}
		</h1>
	</div>
</div>

<div class="mx-5 mt-10 mb-10 flex w-full max-w-7xl flex-col gap-6">
	<Tabs.Root bind:value={params.tab}>
		<Tabs.List>
			<Tabs.Trigger value="overview">Übersicht</Tabs.Trigger>
			<Tabs.Trigger value="questions">Pro Frage</Tabs.Trigger>
			<Tabs.Trigger value="students">Pro Student</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="overview">
			<AnalyticsRoomOverviewTab />
		</Tabs.Content>

		<Tabs.Content value="questions">
			<AnalyticsRoomQuestionsTab />
		</Tabs.Content>

		<Tabs.Content value="students">
			<AnalyticsRoomStudentsTab />
		</Tabs.Content>
	</Tabs.Root>
</div>
