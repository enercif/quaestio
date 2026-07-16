<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import type { MultipleChoiceQuestion, SingleChoiceQuestion } from '$lib/schemas/question.schema';
	import { typeToBadge } from '../quiz.utils';
	import { getTimeAsString, sequenceTypeToString } from './editor-utils';
	import { EditorState } from './editor.state.svelte';

	const state = EditorState.get();
	const selectedQuestion = $derived(state.selectedQuestion!);
</script>

<Card.Root>
	<Card.Content>
		<Field.Group>
			<div class="flex flex-col gap-5">
				<p class="text-muted-foreground">
					Einstellungen | {typeToBadge(selectedQuestion.type)}
				</p>

				<Field.Field>
					<Field.Label for="zeit">Zeit</Field.Label>
					<div class="flex flex-row items-center gap-10">
						<Slider
							id="zeit"
							min={0}
							max={300}
							step={1}
							type="single"
							bind:value={selectedQuestion.timelimit}
						/>
						{getTimeAsString(selectedQuestion.timelimit)}
					</div>
				</Field.Field>

				{#if selectedQuestion.type !== 'open'}
					{@const choiceQuestion = selectedQuestion as
						MultipleChoiceQuestion | SingleChoiceQuestion}
					<Field.Separator />

					<Field.Field>
						<Field.Label for="points">Sequenzierung</Field.Label>
						<Select.Root type="single" bind:value={choiceQuestion.sequence_type}>
							<Select.Trigger class="w-full"
								>{sequenceTypeToString(choiceQuestion.sequence_type)}</Select.Trigger
							>
							<Select.Content>
								<Select.Item value="numeric">Numerisch</Select.Item>
								<Select.Item value="roman">Römisch</Select.Item>
								<Select.Item value="alphabetic">Alphabetisch</Select.Item>
							</Select.Content>
						</Select.Root>
					</Field.Field>
				{/if}

				<Field.Separator />

				<Field.Field>
					{@const pointErrors = state.getSelectedQuestionError('points')}

					<Field.Label for="points">Punkte</Field.Label>
					<Input
						id="points"
						type="number"
						min={0}
						bind:value={selectedQuestion.points}
						aria-invalid={!!pointErrors}
					/>
					{#each pointErrors as error, i (i)}
						<Field.Error>{error}</Field.Error>
					{/each}
				</Field.Field>
			</div>
		</Field.Group>
	</Card.Content>
</Card.Root>
