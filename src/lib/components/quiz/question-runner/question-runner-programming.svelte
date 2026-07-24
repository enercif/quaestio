<script lang="ts">
	import type { LiveProgrammingQuestion } from '$lib/schemas/question.schema';
	import { highlightCode } from '$lib/shiki';
	import { watch } from 'runed';
	import { RunnerState } from './question-runner.state.svelte';

	const runner = RunnerState.get();
	const question = $derived(runner.currentQuestion as LiveProgrammingQuestion);

	let codeContainer: HTMLDivElement | undefined = $state();
	const programmingHtml = $derived.by(() => highlightCode(question.code, question.language));

	watch(
		() => [runner.selected, runner.revealed, runner.correct] as const,
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

	function onCodeClick(event: MouseEvent) {
		if (runner.locked) return;
		const line = (event.target as HTMLElement).closest<HTMLElement>('.line');
		const lineNumber = line?.dataset.line;
		if (!lineNumber) return;
		runner.submit(
			runner.selected.includes(lineNumber)
				? runner.selected.filter((id) => id !== lineNumber)
				: [...runner.selected, lineNumber]
		);
	}
</script>

<div
	bind:this={codeContainer}
	onclick={onCodeClick}
	role="presentation"
	class={[
		'programming-code-preview overflow-x-auto rounded-md border text-sm mt-2 [&_code]:py-3',
		!runner.locked && '[&_.line]:cursor-pointer'
	]}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html await programmingHtml}
</div>

<style>
	.programming-code-preview :global(.line.selected-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--primary) 12%, transparent);
	}

	.programming-code-preview :global(.line.wrong-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--destructive) 15%, transparent);
	}
</style>
