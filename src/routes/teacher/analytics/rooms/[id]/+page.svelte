<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AnalyticsQuestionAnswerRow from '$lib/components/analytics/analytics-question-answer-row.svelte';
	import AnalyticsQuestionStats from '$lib/components/analytics/analytics-question-stats.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { getRoomAnalysis } from '$lib/remote/analytics.remote';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import { BarChart } from 'layerchart';
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import type { PageProps } from './$types';
	type RoomAnalysis = NonNullable<Awaited<ReturnType<typeof getRoomAnalysis>>>;
	type QuestionStat = RoomAnalysis['questionStats'][number];

	let { params }: PageProps = $props();

	const analysis = $derived(await getRoomAnalysis(params.id));

	let tab = $state<'overview' | 'questions' | 'students'>(
		page.url.searchParams.get('student') ? 'students' : 'overview'
	);

	const maxPoints = $derived(
		(analysis?.questionStats ?? []).reduce((sum, q) => sum + q.maxPoints, 0)
	);
	const studentCount = $derived(analysis?.students.length ?? 0);
	const avgAccuracy = $derived(
		studentCount > 0 && maxPoints > 0
			? analysis!.students.reduce((sum, s) => sum + (s.totalPoints / maxPoints) * 100, 0) /
					studentCount
			: 0
	);
	const hardestQuestion = $derived(
		(analysis?.questionStats ?? []).reduce<QuestionStat | undefined>(
			(worst, q) => (worst === undefined || q.accuracy < worst.accuracy ? q : worst),
			undefined
		)
	);
	const easiestQuestion = $derived(
		(analysis?.questionStats ?? []).reduce<QuestionStat | undefined>(
			(best, q) => (best === undefined || q.accuracy > best.accuracy ? q : best),
			undefined
		)
	);
	const scoreDistribution = $derived.by(() => {
		const students = analysis?.students ?? [];
		return Array.from({ length: Math.round(maxPoints) + 1 }, (_, points) => ({
			points,
			count: students.filter((s) => Math.round(s.totalPoints) === points).length
		}));
	});

	const distributionChartConfig = { count: { label: 'Studenten', color: 'var(--chart-1)' } };
	const distributionData = $derived(
		scoreDistribution.map((d) => ({ points: `${d.points}`, count: d.count }))
	);

	const expanded = new SvelteSet<string>();
	function toggle(studentId: string) {
		if (expanded.has(studentId)) expanded.delete(studentId);
		else expanded.add(studentId);
	}
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
				<div class="flex flex-col gap-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
						<Card.Root>
							<Card.Header>
								<Card.Description>Studenten</Card.Description>
								<Card.Title class="text-3xl font-semibold">{studentCount}</Card.Title>
							</Card.Header>
						</Card.Root>
						<Card.Root>
							<Card.Header>
								<Card.Description>Ø Genauigkeit</Card.Description>
								<Card.Title class="text-3xl font-semibold">{Math.round(avgAccuracy)}%</Card.Title>
							</Card.Header>
						</Card.Root>
						<Card.Root>
							<Card.Header>
								<Card.Description>Schwerste Frage</Card.Description>
								<Card.Title class="text-3xl font-semibold">
									{hardestQuestion ? `F${hardestQuestion.position + 1}` : '—'}
								</Card.Title>
							</Card.Header>
						</Card.Root>

						<Card.Root>
							<Card.Header>
								<Card.Description>Einfachste Frage</Card.Description>
								<Card.Title class="text-3xl font-semibold">
									{easiestQuestion ? `F${easiestQuestion.position + 1}` : '—'}
								</Card.Title>
							</Card.Header>
						</Card.Root>
					</div>

					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<Card.Root>
							<Card.Header>
								<Card.Title>Genauigkeit pro Frage</Card.Title>
								<Card.Description>Anteil richtiger Antworten</Card.Description>
							</Card.Header>
							<Card.Content>
								<div class="flex w-full flex-col gap-8">
									{#each analysis.questionStats as stat, i (stat.questionId)}
										<div class="flex flex-col gap-1">
											<div class="flex flex-row items-center justify-between gap-2">
												<p>
													<span class="text-sm text-muted-foreground">
														F{i + 1}
													</span>

													<span class="ml-2 text-left text-sm">
														{stat.question}
													</span>
												</p>

												<span class="text-sm font-semibold tabular-nums">
													{Math.round(stat.accuracy)}%
												</span>
											</div>
											<Progress value={stat.accuracy} class="h-2 w-full" />
										</div>
									{/each}
								</div>
							</Card.Content>
						</Card.Root>

						<Card.Root>
							<Card.Header>
								<Card.Title>Punkteverteilung</Card.Title>
								<Card.Description>Anzahl Studenten je Punktzahl</Card.Description>
							</Card.Header>
							<Card.Content>
								<Chart.Container config={distributionChartConfig} class="w-full">
									<BarChart
										data={distributionData}
										x="points"
										y="count"
										axis="x"
										bandPadding={0.25}
										series={[
											{
												key: 'count',
												label: distributionChartConfig.count.label,
												color: distributionChartConfig.count.color
											}
										]}
										props={{ bars: { radius: 4, stroke: 'none' } }}
									>
										{#snippet tooltip()}
											<Chart.Tooltip indicator="line" />
										{/snippet}
									</BarChart>
								</Chart.Container>
							</Card.Content>
						</Card.Root>
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="questions">
				<div class="flex flex-col gap-4">
					{#each analysis.questionStats as q (q.questionId)}
						<AnalyticsQuestionStats
							question={q}
							selections={analysis.students.map((s) => s.questions[q.position].selected)}
						/>
					{/each}
				</div>
			</Tabs.Content>

			<Tabs.Content value="students">
				<div class="flex flex-col gap-3">
					{#each analysis.students as student (student.studentId)}
						{@const isOpen = expanded.has(student.studentId)}
						{@const accuracy = maxPoints > 0 ? (student.totalPoints / maxPoints) * 100 : 0}
						<div class="rounded-lg border">
							<button
								class="flex w-full flex-row items-center gap-3 px-4 py-3 text-left"
								onclick={() => toggle(student.studentId)}
							>
								<ChevronRightIcon
									class={[
										'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
										isOpen && 'rotate-90'
									]}
								/>
								<span class="font-medium">{student.studentName}</span>
								<span class="ml-auto text-sm tabular-nums text-muted-foreground">
									{student.totalPoints} / {maxPoints} Punkte
								</span>
								<Progress value={accuracy} class="h-2 w-32" />
							</button>

							{#if isOpen}
								<div
									class="flex flex-col gap-2 border-t px-4 py-3"
									transition:slide={{ duration: 150 }}
								>
									{#each student.questions as q, i (q.questionId)}
										<AnalyticsQuestionAnswerRow index={i} question={q} />
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
{:else}
	<p class="mx-5 mt-10 text-sm text-muted-foreground">Dieser Raum wurde nicht gefunden.</p>
{/if}
