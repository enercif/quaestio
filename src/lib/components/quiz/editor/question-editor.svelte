<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import MultipleChoiceQuestionEditor from './multiple-choice-question-editor.svelte';
	import OpenTextQuestionEditor from './open-text-question-editor.svelte';
	import { getQuizEditorState } from './quiz-editor-state.svelte';
	import SingleChoiceQuestionEditor from './single-choice-question-editor.svelte';

	const state = getQuizEditorState();
	const selectedQuestion = $derived(state.selectedQuestion!);
</script>

<div class="col-span-2">
	<Card.Root>
		<Card.Content>
			<Field.Group>
				<div class="flex flex-col gap-5">
					<div class="flex flex-row items-center justify-between">
						<p class="text-muted-foreground">
							Frage {selectedQuestion.position + 1} von {state.quiz.questions.length}
						</p>
						<Button variant="ghost" onclick={() => state.removeQuestion(selectedQuestion.id)}>
							<TrashIcon class="text-destructive" />
							Löschen
						</Button>
					</div>

					{#if selectedQuestion.type === 'open'}
						<OpenTextQuestionEditor />
					{:else if selectedQuestion.type === 'multiple'}
						<MultipleChoiceQuestionEditor />
					{:else if selectedQuestion.type === 'single'}
						<SingleChoiceQuestionEditor />
					{/if}
				</div>
			</Field.Group>
		</Card.Content>
	</Card.Root>
</div>
