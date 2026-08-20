<script lang="ts">
	import FieldErrors from '$lib/components/quiz/editor/editor-field-errors.svelte';
	import EditorEmpty from '$lib/components/quiz/editor/editor-empty.svelte';
	import EditorQuestionList from '$lib/components/quiz/editor/editor-question-list.svelte';
	import EditorQuestionSettings from '$lib/components/quiz/editor/editor-question-settings.svelte';
	import EditorQuestion from '$lib/components/quiz/editor/editor-question.svelte';
	import QuizEditorHeader from '$lib/components/quiz/editor/editor-quiz-header.svelte';
	import EditorQuizSummary from '$lib/components/quiz/editor/editor-quiz-summary.svelte';
	import { EditorState } from '$lib/components/quiz/editor/editor.state.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import CircleQuestionMark from '@lucide/svelte/icons/circle-question-mark';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const state = EditorState.init(data.quiz, data.id);
</script>

<QuizEditorHeader />

<div class="mt-6 flex w-full max-w-7xl flex-col gap-10 mb-10">
	<Field.Set>
		<Field.Group>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<Field.Field aria-invalid={!!state.getQuizError('title')}>
					<Field.Label for="title">Titel</Field.Label>
					<Input
						type="text"
						bind:value={state.quiz.title}
						placeholder="Titel des Quiz"
						class="w-full sm:w-100! font-semibold"
						aria-invalid={!!state.getQuizError('title')}
					/>
					<FieldErrors errors={state.getQuizError('title')} />
				</Field.Field>
				<div class="flex flex-row items-end gap-6">
					<Field.Field class="w-fit">
						<div class="flex item-center gap-2">
							<span class="text-sm text-muted-foreground">
								{state.quiz.visibility === 'public' ? 'Öffentlich' : 'Privat'}
							</span>

							<Switch
								id="visibility"
								checked={state.quiz.visibility === 'public'}
								onCheckedChange={(checked) => {
									state.quiz.visibility = checked ? 'public' : 'private';
									if (!checked) state.quiz.practice_room = false;
								}}
							/>
						</div>
					</Field.Field>

					<Field.Field class="w-fit">
						<div class="flex item-center gap-2">
							<span
								class={[
									'text-sm text-muted-foreground text-nowrap',
									state.quiz.visibility !== 'public' && 'opacity-50'
								]}
							>
								Übungsraum
							</span>

							<Switch
								id="practice_room"
								disabled={state.quiz.visibility !== 'public'}
								checked={state.quiz.practice_room}
								onCheckedChange={(checked) => (state.quiz.practice_room = checked)}
							/>
							{#if state.quiz.visibility !== 'public'}
								<Tooltip.Root>
									<Tooltip.Trigger>
										<CircleQuestionMark class="size-4 text-muted-foreground" />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Übungsräume sind nur für öffentliche Quizze verfügbar</p>
									</Tooltip.Content>
								</Tooltip.Root>
							{/if}
						</div>
					</Field.Field>
				</div>
			</div>
		</Field.Group>

		<div class="flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:gap-4">
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
