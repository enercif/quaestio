<script lang="ts">
	import { indexToSequence, resultClass } from '$lib/components/quiz/quiz.utils';
	import type {
		LiveMultipleChoiceQuestion,
		LiveSingleChoiceQuestion
	} from '$lib/schemas/question.schema';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { deriveRunner, questionRunnerContext } from './question-runner.state.svelte';

	const runner = $derived(deriveRunner(questionRunnerContext.get()));
	const question = $derived(
		runner.currentQuestion as LiveMultipleChoiceQuestion | LiveSingleChoiceQuestion
	);

	function choose(text: string) {
		if (question.type === 'single') {
			runner.submit([text]);
		} else {
			runner.submit(
				runner.selected.includes(text)
					? runner.selected.filter((select) => select !== text)
					: [...runner.selected, text]
			);
		}
	}

	function revealClass(answerId: string) {
		if (runner.correct.includes(answerId)) return resultClass.correct;
		if (runner.selected.includes(answerId)) return resultClass.wrong;
		return 'opacity-60';
	}

	const rowClass = 'w-full flex items-center gap-4 rounded-lg border px-5 py-4';
</script>

<div class="flex flex-col gap-4 w-full mt-5">
	{#each question.answers as answer, index (answer.text)}
		{@const isSelected = runner.selected.includes(answer.text)}
		<button
			type="button"
			class={[
				rowClass,
				'justify-start transition duration-150',
				runner.revealed
					? revealClass(answer.text)
					: [
							'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
							isSelected && 'border-primary bg-primary/5'
						]
			]}
			disabled={runner.locked}
			aria-pressed={isSelected}
			onclick={() => choose(answer.text)}
		>
			<div
				class={[
					'size-10 border grid place-items-center rounded-md transition-colors duration-150',
					!runner.revealed && isSelected && 'bg-primary text-primary-foreground border-primary'
				]}
			>
				{indexToSequence(index, question.sequence_type)}
			</div>

			{answer.text}

			{#if runner.revealed && runner.correct.includes(answer.text)}
				<CheckIcon class="ml-auto size-5 text-green-500" />
			{:else if runner.revealed && isSelected}
				<XIcon class="ml-auto size-5 text-destructive" />
			{/if}
		</button>
	{/each}
</div>
