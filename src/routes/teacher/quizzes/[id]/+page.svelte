<script lang="ts">
	import EditorEmpty from '$lib/components/quiz/editor/editor-empty.svelte';
	import EditorQuestionList from '$lib/components/quiz/editor/editor-question-list.svelte';
	import EditorQuestionSettings from '$lib/components/quiz/editor/editor-question-settings.svelte';
	import EditorQuestion from '$lib/components/quiz/editor/editor-question.svelte';
	import QuizEditorHeader from '$lib/components/quiz/editor/editor-quiz-header.svelte';
	import EditorQuizSummary from '$lib/components/quiz/editor/editor-quiz-summary.svelte';
	import { EditorState } from '$lib/components/quiz/editor/editor.state.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const state = EditorState.init(data.quiz, data.id);
</script>

<QuizEditorHeader />

<div class="mx-5 mt-6 flex w-full max-w-7xl flex-col gap-10 mb-10">
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
			<EditorQuestionList />

			{#if state.selectedQuestion}
				<EditorQuestion />

				<div class="flex flex-col gap-4">
					<EditorQuestionSettings />
					<EditorQuizSummary />
				</div>
			{:else}
				<EditorEmpty />
			{/if}
		</div>
	</Field.Set>
</div>
