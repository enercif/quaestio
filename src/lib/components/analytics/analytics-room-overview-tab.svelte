<script lang="ts">
	import { questionAccuracy } from '$lib/components/analytics/analytics.utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import type { Question } from '$lib/schemas/question.schema';
	import { BarChart } from 'layerchart';

	interface Props {
		students: { totalPoints: number }[];
		questionStats: { question: Question; selections: string[][] }[];
		maxPoints: number;
	}

	let { students, questionStats, maxPoints }: Props = $props();

	const accuracies = $derived(
		questionStats.map((stat, index) => ({
			index,
			question: stat.question.question,
			accuracy: questionAccuracy(stat.question, stat.selections)
		}))
	);

	const studentCount = $derived(students.length);
	const avgAccuracy = $derived(
		studentCount > 0 && maxPoints > 0
			? students.reduce((sum, s) => sum + (s.totalPoints / maxPoints) * 100, 0) / studentCount
			: 0
	);
	const hardestQuestion = $derived(
		accuracies.reduce<(typeof accuracies)[number] | undefined>(
			(worst, q) => (worst === undefined || q.accuracy < worst.accuracy ? q : worst),
			undefined
		)
	);
	const easiestQuestion = $derived(
		accuracies.reduce<(typeof accuracies)[number] | undefined>(
			(best, q) => (best === undefined || q.accuracy > best.accuracy ? q : best),
			undefined
		)
	);

	const scoreDistribution = $derived(
		Array.from({ length: Math.round(maxPoints) + 1 }, (_, points) => ({
			points: `${points}`,
			count: students.filter((s) => Math.round(s.totalPoints) === points).length
		}))
	);

	const distributionChartConfig = { count: { label: 'Studenten', color: 'var(--chart-1)' } };
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
				<Card.Description>Schwerste Frage</Card.Description>
				<Card.Title class="text-3xl font-semibold">
					{hardestQuestion ? `F${hardestQuestion.index + 1}` : '—'}
				</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Description>Einfachste Frage</Card.Description>
				<Card.Title class="text-3xl font-semibold">
					{easiestQuestion ? `F${easiestQuestion.index + 1}` : '—'}
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
					{#each accuracies as stat (stat.index)}
						<div class="flex flex-col gap-1">
							<div class="flex flex-row items-center justify-between gap-2">
								<p>
									<span class="text-sm text-muted-foreground">F{stat.index + 1}</span>
									<span class="ml-2 text-left text-sm">{stat.question}</span>
								</p>
								<span class="text-sm font-semibold tabular-nums">{Math.round(stat.accuracy)}%</span
								>
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
