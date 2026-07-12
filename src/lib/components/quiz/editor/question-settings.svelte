<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { MultipleChoiceQuestion, SingleChoiceQuestion } from '$lib/schemas/question.schema';
	import { getQuizEditorState } from './quiz-editor-state.svelte';
	import { getTimeAsString, sequenceTypeToString, typeToBadge } from './quiz-editor-utils';

	const state = getQuizEditorState();
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
						| MultipleChoiceQuestion
						| SingleChoiceQuestion}
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
					{@const pointErrors1 = state.getSelectedQuestionError('points')}
					{@const pointErrors2 = state.getQuizError(
						`questions.${state.getSelectedQuestionIndex()}.points`
					)}

					<Field.Label for="points">Punkte</Field.Label>
					<Input
						id="points"
						type="number"
						min={0}
						bind:value={selectedQuestion.points}
						aria-invalid={!!pointErrors1 || !!pointErrors2}
					/>
					{#each pointErrors1 as error, i (i)}
						<Field.Error>{error}</Field.Error>
					{/each}
					{#each pointErrors2 as error, i (i)}
						<Field.Error>{error}</Field.Error>
					{/each}
				</Field.Field>

				<Field.Separator />

				<Field.Field>
					<Field.Label for="result-selection">Resultat nach Abgabe anzeigen</Field.Label>
					<Tabs.Root value="no" class="w-full" id="result-selection">
						<Tabs.List class="w-full">
							<Tabs.Trigger value="no">Nein</Tabs.Trigger>
							<Tabs.Trigger value="yes">Ja</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				</Field.Field>
			</div>
		</Field.Group>
	</Card.Content>
</Card.Root>
