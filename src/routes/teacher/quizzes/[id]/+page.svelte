<script lang="ts">
	import EmptyQuestionState from '$lib/components/quiz/editor/empty-question-state.svelte';
	import QuestionEditor from '$lib/components/quiz/editor/question-editor.svelte';
	import QuestionList from '$lib/components/quiz/editor/question-list.svelte';
	import QuestionSettings from '$lib/components/quiz/editor/question-settings.svelte';
	import { createQuizEditorState } from '$lib/components/quiz/editor/quiz-editor-state.svelte';
	import QuizEditorHeader from '$lib/components/quiz/editor/quiz-editor-header.svelte';
	import QuizSummary from '$lib/components/quiz/editor/quiz-summary.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const state = createQuizEditorState(data.quiz, data.id);
</script>

<QuizEditorHeader />

<div class="mx-5 mt-6 flex w-full max-w-7xl flex-col gap-10">
	<Field.Set>
		<Field.Group>
			<Field.Field aria-invalid={!!state.getQuizError('title')}>
				<Field.Label for="title">Titel</Field.Label>
				<Input
					type="text"
					bind:value={state.quiz.title}
					placeholder="Titel des Quiz"
					class="w-100! font-semibold"
					aria-invalid={!!state.getQuizError('title')}
				/>
				{#each state.getQuizError('title') as error, i (i)}
					<Field.Error>{error}</Field.Error>
				{/each}
			</Field.Field>
		</Field.Group>

		<div class="grid grid-cols-4 gap-4">
			<QuestionList />

			{#if state.selectedQuestion}
				<QuestionEditor />

				<div class="flex flex-col gap-4">
					<QuestionSettings />
					<QuizSummary />
				</div>
			{:else}
				<EmptyQuestionState />
			{/if}
		</div>
	</Field.Set>
</div>
