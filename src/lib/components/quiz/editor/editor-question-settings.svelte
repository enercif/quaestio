<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Toggle } from '$lib/components/ui/toggle';
	import type {
		MultipleChoiceQuestion,
		ProgrammingQuestion,
		SingleChoiceQuestion
	} from '$lib/schemas/question.schema';
	import { getQuestionMaxPoints, indexToSequence, typeToBadge } from '../quiz.utils';
	import FieldErrors from './editor-field-errors.svelte';
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

				{#if selectedQuestion.type === 'multiple' || selectedQuestion.type === 'single'}
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

				{#if selectedQuestion.type === 'multiple' || selectedQuestion.type === 'programming'}
					{@const scoredQuestion = selectedQuestion as MultipleChoiceQuestion | ProgrammingQuestion}
					{@const pointErrors = state.getSelectedQuestionError('points')}
					{@const partialPointsErrors = state.getSelectedQuestionError('partial_points')}
					{@const entries =
						scoredQuestion.correct instanceof Array
							? scoredQuestion.correct.map((line) => [line, line])
							: Object.entries(scoredQuestion.correct)}

					<Field.Field>
						<Field.Label>Punkte</Field.Label>

						<Tabs.Root value={scoredQuestion.scoring}>
							<Tabs.List class="w-full">
								<Tabs.Trigger
									class="flex-1"
									value="binary"
									onclick={() => (scoredQuestion.scoring = 'binary')}
								>
									Binär
								</Tabs.Trigger>
								<Tabs.Trigger
									class="flex-1"
									value="partial"
									onclick={() => (scoredQuestion.scoring = 'partial')}
								>
									Teilpunkte
								</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>

						{#if scoredQuestion.scoring === 'binary'}
							<Input
								id="points"
								type="number"
								min={0}
								bind:value={scoredQuestion.points}
								aria-invalid={!!pointErrors}
							/>
							<FieldErrors errors={pointErrors} />
						{:else if entries.length === 0}
							<p class="text-sm text-muted-foreground">
								Markiere zuerst die richtigen {scoredQuestion.type === 'multiple'
									? 'Antworten'
									: 'Zeilen'}.
							</p>
						{:else}
							<div class="flex flex-col gap-2">
								{#each entries as [key, label] (key)}
									{@const displayLabel =
										scoredQuestion.type === 'multiple'
											? indexToSequence(
													scoredQuestion.answers.findIndex((a) => a.id === key),
													scoredQuestion.sequence_type
												)
											: label}
									<div class="flex flex-row items-center gap-2">
										<Toggle disabled class="size-9 disabled:opacity-100" variant="outline">
											{displayLabel}
										</Toggle>
										<Input
											type="number"
											min={0}
											class="w-full"
											bind:value={scoredQuestion.partial_points[key]}
										/>
									</div>
								{/each}
							</div>
							<FieldErrors errors={partialPointsErrors} />
							<p class="text-sm text-muted-foreground">
								Gesamt: {getQuestionMaxPoints(scoredQuestion)} Punkte
							</p>
						{/if}
					</Field.Field>
				{:else}
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
						<FieldErrors errors={pointErrors} />
					</Field.Field>
				{/if}
			</div>
		</Field.Group>
	</Card.Content>
</Card.Root>
