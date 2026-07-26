<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { localePersistedState } from '$lib/state/locale.state.svelte';
	import { BarChart } from 'layerchart';
	import { analyticsRoomContext, AnalyticsRoomState } from './analytics-room.state.svelte';

	const ctx = analyticsRoomContext.get();

	const studentCount = $derived(ctx.students.length);
	const avgAccuracy = $derived(
		ctx.questions.reduce((sum, q) => sum + q.accuracy, 0) / ctx.questions.length
	);
	const hardestQuestion = $derived.by(() => {
		if (ctx.questions.length === 0) return [];
		const minAccuracy = Math.min(...ctx.questions.map((q) => q.accuracy));
		return ctx.questions.filter((q) => q.accuracy === minAccuracy);
	});

	const easiestQuestion = $derived.by(() => {
		if (ctx.questions.length === 0) return [];
		const maxAccuracy = Math.max(...ctx.questions.map((q) => q.accuracy));
		return ctx.questions.filter((q) => q.accuracy === maxAccuracy);
	});

	const scoreDistribution = $derived(
		Array.from({ length: Math.round(ctx.maxPoints) + 1 }, (_, points) => ({
			points: `${points}`,
			count: ctx.students.filter(
				(s) => Math.round(s.questions.reduce((sum, q) => sum + q.achievedPoints, 0)) === points
			).length
		}))
	);

	const distributionChartConfig = { count: { label: 'Studenten', color: 'var(--chart-1)' } };

	function questionsToString(array: typeof AnalyticsRoomState.prototype.questions) {
		return array.length > 0
			? array
					.map((q) => `${localePersistedState.current === 'en' ? 'Q' : 'F'}${q.position + 1}`)
					.join(', ')
			: '—';
	}
</script>

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
				<Card.Description
					>{hardestQuestion.length > 1 ? 'Schwerste Fragen' : 'Schwerste Frage'}</Card.Description
				>
				<Card.Title class="text-3xl font-semibold">
					{questionsToString(hardestQuestion)}
				</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Description
					>{easiestQuestion.length > 1 ? 'Einfachste Fragen' : 'Einfachste Frage'}</Card.Description
				>
				<Card.Title class="text-3xl font-semibold">
					{questionsToString(easiestQuestion)}
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
					{#each ctx.questions as question (question.id)}
						<div class="flex flex-col gap-1">
							<div class="flex flex-row items-center justify-between gap-2">
								<p>
									<span class="text-sm text-muted-foreground">F{question.position}</span>
									<span class="ml-2 text-left text-sm">{question.question}</span>
								</p>
								<span class="text-sm font-semibold tabular-nums"
									>{Math.round(question.accuracy)}%</span
								>
							</div>
							<Progress value={question.accuracy} class="h-2 w-full" />
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
						data={scoreDistribution}
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
