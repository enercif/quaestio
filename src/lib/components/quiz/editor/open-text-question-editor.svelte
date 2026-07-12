<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { OpenTextQuestion } from '$lib/schemas/question.schema';
	import { getQuizEditorState } from './quiz-editor-state.svelte';
	import { UUIDToPromptPlaceholder } from './quiz-editor-utils';

	const state = getQuizEditorState();
	const selectedQuestion = $derived(state.selectedQuestion as OpenTextQuestion);
	const promptError = $derived(
		state.getQuizError(`questions.${state.getSelectedQuestionIndex()}.question`)
	);
	const keywordsError = $derived(
		state.getQuizError(`questions.${state.getSelectedQuestionIndex()}.correct`)
	);
</script>

<Field.Field aria-invalid={!!promptError}>
	<Field.Label for="prompt">Fragenstellung</Field.Label>
	<Textarea
		id="prompt"
		bind:value={selectedQuestion.question}
		placeholder={UUIDToPromptPlaceholder(selectedQuestion.id)}
		aria-invalid={!!promptError}
	/>
	{#each promptError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}
</Field.Field>

<div class=" flex flex-col gap-3">
	<Label for="keywords">Keywords</Label>

	<Input
		id="keywords"
		type="text"
		placeholder="Keyword eingeben und mit Enter bestätigen..."
		onkeydown={(event) => state.onKeywordKeydown(event)}
		bind:value={state.keywordInputValue}
		aria-invalid={!!keywordsError}
	/>

	<div class="flex flex-row items-center gap-2">
		{#each selectedQuestion.correct as keyword, index (index)}
			<Badge class="cursor-pointer" onclick={() => selectedQuestion.correct.splice(index, 1)}>
				{keyword}
			</Badge>
		{/each}
	</div>

	{#each keywordsError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}
</div>
