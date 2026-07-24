<script lang="ts">
	import { indexToSequence } from '$lib/components/quiz/quiz.utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import type { MultipleChoiceQuestion, SingleChoiceQuestion } from '$lib/schemas/question.schema';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import { fade, slide } from 'svelte/transition';
	import { UUIDToAnswerPlaceholder, UUIDToPromptPlaceholder } from './editor-utils';
	import { EditorState } from './editor.state.svelte';

	const state = EditorState.get();
	const selectedQuestion = $derived(
		state.selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion
	);
	const promptError = $derived(state.getSelectedQuestionError('question'));
	const answersError = $derived(state.getSelectedQuestionError('answers'));
	const correctError = $derived(state.getSelectedQuestionError('correct'));
	const reasonsError = $derived(state.getSelectedQuestionError('reasons'));

	$effect(() => {
		for (const answer of selectedQuestion.answers) {
			if (selectedQuestion.correct[answer.id] !== undefined) {
				selectedQuestion.correct[answer.id] = answer.text;
			}
		}
	});
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

	{#each correctError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}

	{#each reasonsError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}

	{#each selectedQuestion.answers as answer, index (answer.id)}
		{@const answerErrors = state.getSelectedQuestionError(`answers.${index}.text`)}
		{@const correct = !!selectedQuestion.correct[answer.id]}

		<div class="flex flex-row items-start gap-2" transition:fade={{ duration: 150 }}>
			<Toggle
				pressed={correct}
				onPressedChange={() => state.toggleCorrectAnswer(selectedQuestion, answer.id, answer.text)}
				variant="outline"
				class="size-9 text-muted-foreground transition-all duration-200 data-[state=on]:border-green-500 data-[state=on]:bg-green-500/10 "
				>{indexToSequence(index, selectedQuestion.sequence_type)}</Toggle
			>

			<div class="flex flex-col gap-2 w-full">
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

				{#if selectedQuestion.type === 'multiple' && correct}
					<div transition:slide={{ duration: 150 }}>
						<Textarea
							placeholder="Warum ist {answer.text} richtig?"
							bind:value={selectedQuestion.reasons[answer.id]}
						/>
					</div>
				{/if}
			</div>

			<Button variant="ghost" onclick={() => state.removeAnswer(selectedQuestion, answer.id)}>
				<XIcon class="text-destructive" />
			</Button>
		</div>
	{/each}

	<Button variant="ghost" class="w-fit" onclick={() => state.addAnswer()}>
		<PlusIcon class="text-primary" />
		Antwort hinzufügen
	</Button>
</div>

{#if selectedQuestion.type === 'single'}
	<Field.Field>
		<Field.Label for="reason">Begründung (optional)</Field.Label>
		<Textarea
			id="reason"
			placeholder={`Warum ist "${Object.values(selectedQuestion.correct)[0]}" die richtige Antwort?`}
			bind:value={selectedQuestion.reasons}
		/>
		{#each promptError as error, i (i)}
			<Field.Error>{error}</Field.Error>
		{/each}
	</Field.Field>
{/if}
