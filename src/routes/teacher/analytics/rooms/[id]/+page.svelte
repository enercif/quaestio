<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AnalyticsRoomOverviewTab from '$lib/components/analytics/analytics-room-overview-tab.svelte';
	import AnalyticsRoomQuestionsTab from '$lib/components/analytics/analytics-room-questions-tab.svelte';
	import AnalyticsRoomStudentsTab from '$lib/components/analytics/analytics-room-students-tab.svelte';
	import { questionResultsFor } from '$lib/components/analytics/analytics.utils';
	import { questionMaxPoints } from '$lib/components/quiz/quiz.utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { getRoomAnalysis } from '$lib/remote/analytics.remote';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const analysis = $derived(await getRoomAnalysis(params.id));

	let tab = $state<'overview' | 'questions' | 'students'>(
		page.url.searchParams.get('student') ? 'students' : 'overview'
	);

	const questions = $derived(
		analysis?.quiz.questions.toSorted((a, b) => a.position - b.position) ?? []
	);
	const maxPoints = $derived(questions.reduce((sum, q) => sum + questionMaxPoints(q), 0));

	const students = $derived.by(() => {
		const answers = analysis?.answers ?? [];
		const studentIds = [...new Set(answers.map((a) => a.student_id))];
		return studentIds
			.map((studentId) => {
				const studentAnswers = answers.filter((a) => a.student_id === studentId);
				const questionResults = questionResultsFor(questions, studentAnswers);
				return {
					studentId,
					studentName: studentAnswers[0].student_name,
					questions: questionResults,
					totalPoints: questionResults.reduce((sum, q) => sum + q.points, 0)
				};
			})
			.sort((a, b) => a.studentName.localeCompare(b.studentName));
	});

	const questionStats = $derived(
		questions.map((question, index) => ({
			question,
			selections: students.map((s) => s.questions[index].selected)
		}))
	);
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" href={resolve('/teacher/analytics/rooms')}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{analysis?.quiz.title ?? 'Raum'}
		</h1>

		<div class="ml-auto flex flex-row items-center gap-3">
			<Button variant="outline" disabled>
				<DownloadIcon />
				Export CSV
			</Button>
		</div>
	</div>
</div>

{#if analysis}
	<div class="mx-5 mt-10 mb-10 flex w-full max-w-7xl flex-col gap-6">
		<Tabs.Root value={tab}>
			<Tabs.List>
				<Tabs.Trigger value="overview" onclick={() => (tab = 'overview')}>Übersicht</Tabs.Trigger>
				<Tabs.Trigger value="questions" onclick={() => (tab = 'questions')}>Pro Frage</Tabs.Trigger>
				<Tabs.Trigger value="students" onclick={() => (tab = 'students')}>Pro Student</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="overview">
				<AnalyticsRoomOverviewTab {students} {questionStats} {maxPoints} />
			</Tabs.Content>

			<Tabs.Content value="questions">
				<AnalyticsRoomQuestionsTab {questionStats} />
			</Tabs.Content>

			<Tabs.Content value="students">
				<AnalyticsRoomStudentsTab {students} {maxPoints} />
			</Tabs.Content>
		</Tabs.Root>
	</div>
{:else}
	<p class="mx-5 mt-10 text-sm text-muted-foreground">Dieser Raum wurde nicht gefunden.</p>
{/if}
