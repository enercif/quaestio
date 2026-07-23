<script lang="ts">
	import { correctAnswersFor, questionAccuracy } from '$lib/components/analytics/analytics.utils';
	import { typeToBadge } from '$lib/components/quiz/quiz.utils';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Question } from '$lib/schemas/question.schema';
	import { highlightCode } from '$lib/shiki';
	import { watch } from 'runed';
	import { SvelteMap } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';

	interface Props {
		index: number;
		question: Question;
		selections: string[][];
	}

	let { index, question, selections }: Props = $props();

	const accuracy = $derived(questionAccuracy(question, selections));
	const correct = $derived(correctAnswersFor(question));

	const respondents = $derived(selections.filter((s) => s.length > 0).length);

	function pct(count: number) {
		return respondents ? Math.round((count / respondents) * 100) : 0;
	}

	const optionCounts = $derived(
		question.type === 'multiple' || question.type === 'single'
			? question.answers.map((answer) => ({
					...answer,
					correct: correct.includes(answer.text),
					count: selections.filter((s) => s.includes(answer.text)).length
				}))
			: []
	);

	const lineCounts = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const selected of selections) {
			for (const line of selected) map.set(line, (map.get(line) ?? 0) + 1);
		}
		return map;
	});
	const sortedLines = $derived([...lineCounts].sort(([a], [b]) => Number(a) - Number(b)));

	let codeContainer: HTMLDivElement | undefined = $state();
	const programmingHtml = $derived.by(async () => {
		if (question.type !== 'programming') return '';
		return highlightCode(question.code, question.language);
	});

	watch([() => lineCounts, () => correct, () => isOpen], ([counts, correctLines]) => {
		if (!codeContainer) return;
		for (const line of codeContainer.querySelectorAll<HTMLElement>('.line')) {
			const lineNumber = line.dataset.line;
			if (!lineNumber) continue;
			const voteCount = counts.get(lineNumber) ?? 0;
			line.dataset.votes = voteCount ? `${voteCount}×` : '';
			line.classList.toggle('correct-line', correctLines.includes(lineNumber));
		}
	});

	let isOpen = $state(false);
</script>

<Card.Root onclick={() => (isOpen = !isOpen)} class="cursor-pointer">
	<Card.Header>
		<div class="flex flex-col gap-2 items-start w-full">
			<div class="flex flex-row items-center gap-2 w-full">
				<p class="text-muted-foreground">Frage {index + 1}</p>
				<Badge variant="secondary">{typeToBadge(question.type)}</Badge>
				<span class="ml-auto shrink-0 text-sm font-semibold">
					{Math.round(accuracy)}% Genauigkeit
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
				{#if question.type === 'open'}
					<p class="text-sm text-muted-foreground">
						Freitext-Antworten können unter "Pro Student" geprüft werden.
					</p>
				{:else if question.type === 'programming'}
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div
							bind:this={codeContainer}
							class="programming-code-preview overflow-x-auto rounded-md border text-sm [&_code]:py-3"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html await programmingHtml}
						</div>
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
						{#each optionCounts as answer (answer.id)}
							<div
								class={[
									'relative overflow-hidden rounded-lg border px-4 py-3',
									answer.correct && 'border-green-500'
								]}
							>
								<div
									class={[
										'absolute inset-y-0 left-0 transition-[width] duration-300',
										answer.correct ? 'bg-green-500/15' : 'bg-primary/10'
									]}
									style:width="{pct(answer.count)}%"
								></div>
								<div class="relative flex flex-row items-center justify-between">
									<span>{answer.text}</span>
									<span class="text-sm tabular-nums text-muted-foreground">
										{answer.count} · {pct(answer.count)}%
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

<style>
	.programming-code-preview :global(.line::after) {
		content: attr(data-votes);
		color: var(--muted-foreground);
		padding-inline: 0.75rem;
		font-size: 0.75rem;
	}
</style>
