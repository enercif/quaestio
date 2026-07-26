<script lang="ts">
	import CodeLines, { type LineState } from '$lib/components/quiz/code-lines.svelte';
	import type { LiveProgrammingQuestion } from '$lib/schemas/question.schema';
	import { RunnerState } from './question-runner.state.svelte';

	const runner = RunnerState.get();
	const question = $derived(runner.currentQuestion as LiveProgrammingQuestion);

	function lineState(line: string): LineState | undefined {
		if (!runner.revealed) return runner.selected.includes(line) ? 'selected' : undefined;
		if (runner.correct.includes(line)) return 'correct';
		if (runner.selected.includes(line)) return 'wrong';
	}

	function toggleLine(line: string) {
		runner.submit(
			runner.selected.includes(line)
				? runner.selected.filter((selected) => selected !== line)
				: [...runner.selected, line]
		);
	}
</script>

<CodeLines
	code={question.code}
	language={question.language}
	{lineState}
	onLineClick={runner.locked ? undefined : toggleLine}
	class="mt-2"
/>
