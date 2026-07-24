<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import XIcon from '@lucide/svelte/icons/x';
	import { fade } from 'svelte/transition';
	import EditorChoiceQuestion from './editor-choice-question.svelte';
	import EditorOpenQuestion from './editor-open-question.svelte';
	import EditorProgrammingQuestion from './editor-programming-question.svelte';
	import { EditorState } from './editor.state.svelte';

	const state = EditorState.get();
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
						<EditorOpenQuestion />
					{:else if selectedQuestion.type === 'programming'}
						<EditorProgrammingQuestion />
					{:else}
						<EditorChoiceQuestion />
					{/if}

					<Field.Field>
						<Field.Label for="hint">Hinweis (optional)</Field.Label>
						<Textarea
							id="hint"
							bind:value={selectedQuestion.hint}
							placeholder="Optionaler Hinweis..."
						/>
					</Field.Field>

					<div class="flex flex-col gap-3">
						<Label>Hilfreiche Links (nur im Übungsraum sichtbar)</Label>

						{#each selectedQuestion.resources as resource, index (resource.id)}
							{@const labelError = state.getSelectedQuestionError(`resources.${index}.label`)}
							{@const hrefError = state.getSelectedQuestionError(`resources.${index}.href`)}

							<div class="flex flex-row items-start gap-2" transition:fade={{ duration: 150 }}>
								<div class="flex flex-col gap-2 w-full">
									<Field.Field aria-invalid={!!labelError}>
										<Input
											type="text"
											placeholder="Linktext"
											bind:value={resource.label}
											aria-invalid={!!labelError}
										/>
										{#each labelError as error, i (i)}
											<Field.Error>{error}</Field.Error>
										{/each}
									</Field.Field>
									<Field.Field aria-invalid={!!hrefError}>
										<Input
											type="text"
											placeholder="https://..."
											bind:value={resource.href}
											aria-invalid={!!hrefError}
										/>
										{#each hrefError as error, i (i)}
											<Field.Error>{error}</Field.Error>
										{/each}
									</Field.Field>
								</div>

								<Button variant="ghost" onclick={() => state.removeResource(resource.id)}>
									<XIcon class="text-destructive" />
								</Button>
							</div>
						{/each}

						<Button variant="ghost" class="w-fit" onclick={() => state.addResource()}>
							<PlusIcon class="text-primary" />
							Link hinzufügen
						</Button>
					</div>
				</div>
			</Field.Group>
		</Card.Content>
	</Card.Root>
</div>
