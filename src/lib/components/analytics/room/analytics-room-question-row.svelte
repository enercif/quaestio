<script lang="ts">
	import { correctToArray } from '$lib/components/analytics/analytics.utils';
	import CodeLines from '$lib/components/quiz/code-lines.svelte';
	import { typeToBadge } from '$lib/components/quiz/quiz.utils';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import type { AnalyticsRoomState } from './analytics-room.state.svelte';

	interface Props {
		question: (typeof AnalyticsRoomState.prototype.questions)[number];
		quiz: typeof AnalyticsRoomState.prototype.quiz;
	}

	let { question, quiz }: Props = $props();

	let isOpen = $state(false);

	const currentQuestion = $derived(quiz.questions.find((q) => q.id === question.id)!);
	const correct = $derived(correctToArray(currentQuestion));
	const respondents = $derived(question.selected.length);

	const lineCounts = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const selected of question.selected) {
			for (const line of selected) map.set(line, (map.get(line) ?? 0) + 1);
		}
		return map;
	});

	const sortedLines = $derived([...lineCounts].sort(([a], [b]) => Number(a) - Number(b)));

	function pct(count: number) {
		return respondents ? Math.round((count / respondents) * 100) : 0;
	}
</script>

<Card.Root onclick={() => (isOpen = !isOpen)} class="cursor-pointer">
	<Card.Header>
		<div class="flex flex-col gap-2 items-start w-full">
			<div class="flex flex-row items-center gap-2 w-full">
				<p class="text-muted-foreground">Frage {currentQuestion.position + 1}</p>
				<Badge variant="secondary">{typeToBadge(currentQuestion.type)}</Badge>
				<span class="ml-auto shrink-0 text-sm font-semibold">
					{Math.round(question.accuracy)}% Genauigkeit
				</span>
			</div>
			<div class="flex flex-row items-center gap-2 w-full">
				<Card.Title class="font-medium">{question.question}</Card.Title>
			</div>
		</div>
	</Card.Header>

	{#if isOpen}
		<div transition:slide={{ duration: 150 }}>
			<Card.Content>
				{#if currentQuestion.type === 'open'}
					<p class="text-sm text-muted-foreground">
						Freitext-Antworten können unter "Pro Student" geprüft werden.
					</p>
				{:else if currentQuestion.type === 'programming'}
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<CodeLines
							code={currentQuestion.code}
							language={currentQuestion.language}
							votes={lineCounts}
							lineState={(line) => (correct.includes(line) ? 'correct' : undefined)}
						/>
						<div class="flex flex-col gap-2">
							{#each sortedLines as [line, count] (line)}
								<div
									class={[
										'flex flex-row items-center justify-between rounded-lg border px-4 py-3',
										correct.includes(line) && 'border-green-500 bg-green-500/10'
									]}
								>
									<span>Zeile {line}</span>
									<span class="text-sm text-muted-foreground">{count}× · {pct(count)}%</span>
								</div>
							{:else}
								<p class="text-sm text-muted-foreground">Noch keine Antworten.</p>
							{/each}
						</div>
					</div>
				{:else}
					<div class="flex flex-col gap-3">
						{#each currentQuestion.answers as answer (answer.id)}
							{@const isCorrect = !!currentQuestion.correct[answer.id]}
							{@const answerCount = question.selected.filter((s) => s.includes(answer.text)).length}
							<div
								class={[
									'relative overflow-hidden rounded-lg border px-4 py-3',
									isCorrect && 'border-green-500'
								]}
							>
								<div
									class={[
										'absolute inset-y-0 left-0 transition-[width] duration-300',
										isCorrect ? 'bg-green-500/15' : 'bg-primary/10'
									]}
									style:width="{pct(answerCount)}%"
								></div>
								<div class="relative flex flex-row items-center justify-between">
									<span>{answer.text}</span>
									<span class="text-sm tabular-nums text-muted-foreground">
										{answerCount} · {pct(answerCount)}%
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</div>
	{/if}
</Card.Root>
