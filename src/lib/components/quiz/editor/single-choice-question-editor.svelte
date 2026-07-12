<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import type { SingleChoiceQuestion } from '$lib/schemas/question.schema';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import { getQuizEditorState } from './quiz-editor-state.svelte';
	import {
		indexToSequence,
		UUIDToAnswerPlaceholder,
		UUIDToPromptPlaceholder
	} from './quiz-editor-utils';

	const state = getQuizEditorState();
	const selectedQuestion = $derived(state.selectedQuestion as SingleChoiceQuestion);
	const promptError = $derived(state.getSelectedQuestionError('question'));
	const answersError = $derived(state.getSelectedQuestionError('answers'));
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
	<Label>Antworten</Label>

	{#each answersError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}

	{#each selectedQuestion.answers as answer, index (answer.id)}
		{@const answerErrors = state.getSelectedQuestionError(`answers.${index}.text`)}
		<div class="flex flex-row items-start gap-2">
			<Toggle
				pressed={state.isCorrectAnswer(selectedQuestion, answer.id)}
				onPressedChange={() => state.setSingleCorrectAnswer(selectedQuestion, answer.id)}
				variant="outline"
				class="size-9 text-muted-foreground transition-all duration-200 data-[state=on]:border-green-500 data-[state=on]:bg-green-500/10 "
				>{indexToSequence(index, selectedQuestion.sequence_type)}</Toggle
			>

			<Field.Field aria-invalid={!!answerErrors}>
				<Input
					type="text"
					placeholder={UUIDToAnswerPlaceholder(selectedQuestion.id)}
					bind:value={answer.text}
					aria-invalid={!!answerErrors}
				/>

				{#each answerErrors as error, i (i)}
					<Field.Error>{error}</Field.Error>
				{/each}
			</Field.Field>

			<Button variant="ghost" onclick={() => state.removeAnswer(selectedQuestion, answer.id)}>
				<XIcon class="text-destructive" />
			</Button>
		</div>
	{/each}

	<Button variant="ghost" class="w-fit" onclick={() => state.addAnswerToSelectedQuestion()}>
		<PlusIcon class="text-primary" />
		Antwort hinzufügen
	</Button>
</div>
