<script lang="ts">
	import { answerTexts, evaluateAnswer } from '$lib/components/quiz/quiz.utils';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';
	import { slide } from 'svelte/transition';
	import { RunnerState } from './question-runner.state.svelte';

	const runner = RunnerState.get();
	const result = $derived(
		evaluateAnswer(runner.currentQuestion.type, runner.correct, runner.selected)
	);
</script>

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
					Deine Antwort: {answerTexts(runner.currentQuestion.type, runner.selected) || 'Keine'} | {runner
						.currentQuestion.type === 'open'
						? 'Gesuchte Keywords'
						: 'Richtig'}: {answerTexts(runner.currentQuestion.type, runner.correct)}
				</span>
			</div>
		{/if}
	</div>

	{#if runner.reasons.length > 0}
		<div class="flex flex-col mt-4 ml-11">
			<p class="font-semibold mb-1">Begründung</p>
			{#each runner.reasons as reason, index (index)}
				<p>{reason}</p>
			{/each}
		</div>
	{/if}
</div>
