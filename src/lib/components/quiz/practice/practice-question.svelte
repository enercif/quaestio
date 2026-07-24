<script lang="ts">
	import LiveQuestionHeader from '$lib/components/quiz/live/live-question-header.svelte';
	import type { PracticeState } from '$lib/components/quiz/practice/practice.state.svelte';
	import {
		evaluateAnswer,
		indexToSequence,
		remainingMs,
		resultClass,
		typeToBadge,
		typeToDescription
	} from '$lib/components/quiz/quiz.utils';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { highlightCode } from '$lib/shiki';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import SendIcon from '@lucide/svelte/icons/send';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';
	import { watch } from 'runed';
	import { fade, slide } from 'svelte/transition';

	let { practice }: { practice: PracticeState } = $props();

	const previewState = $derived(practice.preview_state);
	const currentQuestion = $derived(practice.currentQuestion);
	const revealed = $derived(practice.roomState === 'answer');
	const correct = $derived(practice.current_answers);
	const reasons = $derived(practice.current_reasons);
	const paused = $derived(practice.paused_remaining != null);
	const timeUp = $derived(remainingMs(practice.roomView) === 0);
	const locked = $derived(revealed || paused || timeUp);
	const selected = $derived(practice.selected);
	const result = $derived(
		revealed ? evaluateAnswer(currentQuestion.type, correct, selected) : null
	);

	let openText = $state('');
	let codeContainer: HTMLDivElement | undefined = $state();
	const programmingHtml = $derived.by(async () => {
		if (currentQuestion.type !== 'programming') return '';
		return highlightCode(currentQuestion.code, currentQuestion.language);
	});

	watch(
		() => [selected, revealed, correct] as const,
		([selected, revealed, correct]) => {
			if (!codeContainer) return;
			for (const line of codeContainer.querySelectorAll<HTMLElement>('.line')) {
				const lineNumber = line.dataset.line;
				if (!lineNumber) continue;
				const isSelected = selected.includes(lineNumber);
				line.classList.toggle('selected-line', !revealed && isSelected);
				line.classList.toggle('correct-line', revealed && correct.includes(lineNumber));
				line.classList.toggle(
					'wrong-line',
					revealed && isSelected && !correct.includes(lineNumber)
				);
			}
		}
	);

	watch(
		() => currentQuestion.id,
		() => {
			openText = '';
		}
	);

	function choose(text: string) {
		if (currentQuestion.type === 'single') {
			practice.submit([text]);
		} else {
			practice.submit(
				selected.includes(text) ? selected.filter((select) => select !== text) : [...selected, text]
			);
		}
	}

	function answerTexts(answers: string[]) {
		if (currentQuestion.type === 'programming') {
			return answers.length ? `Zeile ${answers.join(', ')}` : '';
		}
		return answers.join(', ');
	}

	function onCodeClick(event: MouseEvent) {
		if (locked) return;
		const line = (event.target as HTMLElement).closest<HTMLElement>('.line');
		const lineNumber = line?.dataset.line;
		if (!lineNumber) return;
		practice.submit(
			selected.includes(lineNumber)
				? selected.filter((id) => id !== lineNumber)
				: [...selected, lineNumber]
		);
	}

	function revealClass(answerId: string) {
		if (correct.includes(answerId)) return resultClass.correct;
		if (selected.includes(answerId)) return resultClass.wrong;
		return 'opacity-60';
	}

	const rowClass = 'w-full flex items-center gap-4 rounded-lg border px-5 py-4';
</script>

<div class="px-10 mt-5 flex flex-col size-full max-w-6xl justify-start pb-24">
	<LiveQuestionHeader room={practice.roomView} />

	<div class="flex flex-row items-center gap-4">
		<Tooltip.Root>
			<Tooltip.Trigger class="w-fit mt-10 cursor-help">
				<Badge variant="default">{typeToBadge(currentQuestion.type)}</Badge>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{typeToDescription(currentQuestion.type)}</p>
			</Tooltip.Content>
		</Tooltip.Root>

		{#if currentQuestion.hint}
			<Tooltip.Root>
				<Tooltip.Trigger class="w-fit mt-10 cursor-help">
					<Badge variant="secondary">Hinweis</Badge>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{currentQuestion.hint}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>

	<h1 class="text-3xl font-semibold mt-2">{currentQuestion.question}</h1>

	{#if previewState === 'practice' && currentQuestion.resources.length > 0}
		<div class="flex flex-row flex-wrap gap-2 mt-4">
			{#each currentQuestion.resources as resource (resource.id)}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<Button variant="outline" href={resource.href} target="_blank" rel="noopener noreferrer">
					<LinkIcon class="size-3.5" />
					{resource.label}
				</Button>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/each}
		</div>
	{/if}

	<div class="flex flex-col mt-5 justify-start relative">
		{#if !revealed && (paused || timeUp)}
			<div
				transition:fade={{ duration: 50 }}
				class="absolute -inset-5 z-10 grid place-items-center backdrop-blur-xs font-medium"
			>
				<div class="flex flex-row items-center gap-2 w-fit bg-background/50 p-2 rounded-lg">
					{#if paused}
						<PauseIcon class="size-4" />
						Pausiert
					{:else}
						<ClockIcon class="size-4" />
						Zeit abgelaufen
					{/if}
				</div>
			</div>
		{/if}

		{#if currentQuestion.type === 'open'}
			<form
				class="flex flex-col items-end gap-3 w-full mt-5"
				onsubmit={(event) => {
					event.preventDefault();
					if (openText.trim()) practice.submit([openText.trim()]);
				}}
			>
				<Textarea
					placeholder="Deine Antwort…"
					bind:value={openText}
					disabled={locked}
					class="h-50"
				/>
				<div class="flex flex-row justify-between items-start w-full">
					<span class="text-sm text-muted-foreground">{openText.length} Zeichen</span>

					{#if !revealed}
						<Button type="submit" disabled={locked || !openText.trim()}>
							<SendIcon />
							Senden
						</Button>
					{/if}
				</div>
			</form>
			{#if selected[0]}
				<p class="mt-2 text-sm text-muted-foreground">Gesendet: {selected[0]}</p>
			{/if}
		{:else if currentQuestion.type === 'programming'}
			<div
				bind:this={codeContainer}
				onclick={onCodeClick}
				role="presentation"
				class={[
					'programming-code-preview overflow-x-auto rounded-md border text-sm mt-2 [&_code]:py-3',
					!locked && '[&_.line]:cursor-pointer'
				]}
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html await programmingHtml}
			</div>
		{:else}
			<div class="flex flex-col gap-4 w-full mt-5">
				{#each currentQuestion.answers as answer, index (answer.text)}
					{@const isSelected = selected.includes(answer.text)}
					<button
						type="button"
						class={[
							rowClass,
							'justify-start transition duration-150',
							revealed
								? revealClass(answer.text)
								: [
										'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
										isSelected && 'border-primary bg-primary/5'
									]
						]}
						disabled={locked}
						aria-pressed={isSelected}
						onclick={() => choose(answer.text)}
					>
						<div
							class={[
								'size-10 border grid place-items-center rounded-md transition-colors duration-150',
								!revealed && isSelected && 'bg-primary text-primary-foreground border-primary'
							]}
						>
							{indexToSequence(index, currentQuestion.sequence_type)}
						</div>

						{answer.text}

						{#if revealed && correct.includes(answer.text)}
							<CheckIcon class="ml-auto size-5 text-green-500" />
						{:else if revealed && isSelected}
							<XIcon class="ml-auto size-5 text-destructive" />
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if revealed}
			<div
				in:slide={{ duration: 150 }}
				class={[
					'mt-10 rounded-lg border px-5 py-4 flex flex-col  gap-4 text-sm',
					result === 'correct' && 'border-green-500 bg-green-500/10 text-green-600',
					result === 'partial' && 'border-yellow-500 bg-yellow-500/10 text-yellow-600',
					result === 'wrong' && 'border-destructive bg-destructive/10 text-destructive'
				]}
			>
				<div class="flex flex-row gap-4 items-center">
					{#if result === 'correct'}
						<CheckIcon class="size-7" />
						Richtige Antwort!
					{:else}
						{#if result === 'partial'}
							<TriangleAlertIcon class="size-7" />
						{:else}
							<XIcon class="size-7" />
						{/if}
						<div class="flex flex-col">
							<span class="font-semibold mb-1">
								{result === 'partial' ? 'Teilweise richtig' : 'Falsche Antwort'}
							</span>
							<span>
								Deine Antwort: {answerTexts(selected) || 'Keine'} | {currentQuestion.type === 'open'
									? 'Gesuchte Keywords'
									: 'Richtig'}: {answerTexts(correct)}
							</span>
						</div>
					{/if}
				</div>

				{#if reasons.length > 0}
					<div class="flex flex-col mt-4 ml-11">
						<p class="font-semibold mb-1">Begründung</p>
						{#each reasons as reason, index (index)}
							<p>{reason}</p>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.programming-code-preview :global(.line.selected-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--primary) 12%, transparent);
	}

	.programming-code-preview :global(.line.wrong-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--destructive) 15%, transparent);
	}
</style>
