<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import { placeholders } from '$lib/placeholders';
	import { deleteQuizById, insertQuiz, updateQuiz } from '$lib/remote/quiz.remote';
	import {
		type MultipleChoiceQuestion,
		type OpenTextQuestion,
		type QuestionAnswer,
		type QuestionType,
		type SequenceType,
		type SingleChoiceQuestion
	} from '$lib/schemas/question.schema';
	import { quizInsertSchema, type QuizUpdate } from '$lib/schemas/quiz.schema';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SaveIcon from '@lucide/svelte/icons/save';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import XIcon from '@lucide/svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let quiz = $state(data.quiz);
	let quizId = $derived(data.id);

	const estTime = $derived(
		getTimeAsString(quiz.questions.reduce((acc, q) => acc + q.timelimit, 0))
	);
	const totalPoints = $derived(quiz.questions.reduce((acc, q) => acc + q.points, 0));

	let selectedQuestion: MultipleChoiceQuestion | SingleChoiceQuestion | OpenTextQuestion | null =
		$state(quiz.questions[0] ?? null);

	let keywordInputValue = $state('');

	function addMultipleChoiceQuestion() {
		const newMCQuestion: MultipleChoiceQuestion = {
			id: crypto.randomUUID(),
			type: 'multiple',
			timelimit: 30,
			points: 1,
			prompt: '',
			answers: [],
			sequence_type: 'numeric',
			position: quiz.questions.length
		};
		quiz.questions.push(newMCQuestion);
		selectedQuestion = quiz.questions[quiz.questions.length - 1];
	}

	function addSingleChoiceQuestion() {
		const newSCQuestion: SingleChoiceQuestion = {
			id: crypto.randomUUID(),
			type: 'single',
			timelimit: 30,
			points: 1,
			prompt: '',
			answers: [],
			sequence_type: 'numeric',
			position: quiz.questions.length
		};
		quiz.questions.push(newSCQuestion);
		selectedQuestion = quiz.questions[quiz.questions.length - 1];
	}

	function addOpenTextQuestion() {
		const newOTQuestion: OpenTextQuestion = {
			id: crypto.randomUUID(),
			type: 'open',
			timelimit: 30,
			points: 1,
			prompt: '',
			keywords: [],
			position: quiz.questions.length
		};
		quiz.questions.push(newOTQuestion);
		selectedQuestion = quiz.questions[quiz.questions.length - 1];
	}

	function addAnswerToSelectedQuestion() {
		if (!selectedQuestion || selectedQuestion.type === 'open') return;
		const newAnswer: QuestionAnswer = {
			id: crypto.randomUUID(),
			text: '',
			is_correct: false,
			position: (selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion).answers.length
		};
		(selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion).answers.push(newAnswer);
	}

	function typeToBadge(type: QuestionType) {
		switch (type) {
			case 'multiple':
				return 'Multiple Choice';
			case 'single':
				return 'Single Choice';
			case 'open':
				return 'Open Text';
		}
	}

	function sequenceTypeToString(type: SequenceType) {
		switch (type) {
			case 'numeric':
				return 'Numerisch';
			case 'roman':
				return 'Römisch';
			case 'alphabetic':
				return 'Alphabetisch';
		}
	}

	function indexToSequence(index: number, type: SequenceType) {
		switch (type) {
			case 'numeric':
				return (index + 1).toString();
			case 'roman':
				return toRoman(index + 1);
			case 'alphabetic':
				return String.fromCharCode(65 + index);
		}

		function toRoman(num: number): string {
			if (num <= 0 || num > 3999) throw new RangeError('Number must be between 1 and 3999');

			const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
			const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

			let result = '';
			for (let i = 0; i < values.length; i++) {
				while (num >= values[i]) {
					result += symbols[i];
					num -= values[i];
				}
			}
			return result;
		}
	}

	function getTimeAsString(seconds: number) {
		if (seconds === 0) return 'Keins';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}s`;
	}

	function onkeydown(event: KeyboardEvent, selectedQuestion: OpenTextQuestion) {
		if (event.key === 'Enter') {
			const trimmed = keywordInputValue.trim();
			if (trimmed) {
				selectedQuestion.keywords = [...selectedQuestion.keywords, trimmed];
				keywordInputValue = '';
			}
		}
	}

	function removeAnswer(question: MultipleChoiceQuestion | SingleChoiceQuestion, answerId: string) {
		question.answers = question.answers.filter((a) => a.id !== answerId);
	}

	function removeQuestion(questionId: string) {
		quiz.questions = quiz.questions.filter((q) => q.id !== questionId);
		if (selectedQuestion?.id === questionId) {
			selectedQuestion = null;
		}

		quiz.questions.forEach((q, index) => (q.position = index));
		selectedQuestion = quiz.questions[0] ?? null;
	}

	async function save() {
		try {
			quizInsertSchema.parse(quiz);
		} catch (e) {
			console.error(e);
			toast.warning('Bitte überprüfe deine Eingaben. Einige Felder sind ungültig oder fehlen.');
			return;
		}

		if (quizId) {
			const update: QuizUpdate = {
				id: quizId,
				...quiz
			};
			const result = await updateQuiz(update);
			if (result.success) {
				toast.success('Quiz erfolgreich aktualisiert!');
			} else {
				toast.error('Fehler beim Aktualisieren des Quiz.');
			}
		} else {
			const result = await insertQuiz(quiz);
			if (result.success) {
				toast.success('Quiz erfolgreich erstellt!');
				goto(resolve(`/teacher/quizzes/${result.quiz?.id}`));
			} else {
				toast.error('Fehler beim Erstellen des Quiz.');
			}
		}
	}

	async function remove() {
		if (!quizId) return;
		const result = await deleteQuizById(quizId);
		if (result.success) {
			toast.success('Quiz erfolgreich gelöscht!');
			goto(resolve('/teacher/quizzes'));
		} else {
			toast.error('Fehler beim Löschen des Quiz.');
		}
	}

	function hashUUID(uuid: string) {
		return uuid
			.replace(/-/g, '')
			.split('')
			.reduce((acc, char) => {
				return (acc * 31 + char.charCodeAt(0)) >>> 0;
			}, 0);
	}

	function UUIDToPromptPlaceholder(uuid: string) {
		const hash = hashUUID(uuid);
		return placeholders[hash % placeholders.length].prompt;
	}

	function UUIDToAnswerPlaceholder(uuid: string) {
		const hash = hashUUID(uuid);
		const answers = placeholders[hash % placeholders.length].answers;
		return answers[Math.floor(Math.random() * answers.length)];
	}
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" href={resolve('/teacher/quizzes')}>
			<ArrowLeftIcon />
			Back
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{quiz.title}
		</h1>

		<div class="ml-auto flex flex-row items-center gap-3">
			{#if quizId}
				<Button variant="destructive" onclick={remove}>
					<TrashIcon />
					Löschen
				</Button>
			{/if}

			<Button variant="ghost">
				<EyeIcon />
				Übersicht
			</Button>

			<Button variant="secondary" onclick={save}>
				<SaveIcon />

				Speichern
			</Button>

			<Button>
				<PlayIcon />
				Starte Quiz
			</Button>
		</div>
	</div>
</div>

<div class="mx-5 mt-8 flex w-full max-w-7xl flex-col gap-10">
	<Field.Set>
		<Field.Group>
			<Field.Field>
				<Field.Label for="title">Titel</Field.Label>
				<Input
					type="text"
					bind:value={quiz.title}
					placeholder="Titel des Quiz"
					class="w-100! font-semibold"
				/>
				<!--
					<Field.Error>Der Titel darf nicht leer sein.</Field.Error>
				-->
			</Field.Field>
		</Field.Group>

		<div class="grid grid-cols-4 gap-4">
			<div class="flex flex-col gap-2 text-xs">
				<div class="flex flex-row justify-between text-muted-foreground">
					<p class="tracking-wide uppercase">Fragen</p>
					<p>{quiz.questions.length}</p>
				</div>

				<div class="my-2 flex flex-col gap-2">
					{#each quiz.questions as question, index (index)}
						<button
							class="flex cursor-pointer flex-col gap-2 rounded-md border px-3 py-2.5 text-start transition-all duration-150 {selectedQuestion?.id ===
							question.id
								? 'border-primary bg-primary/3'
								: ''}"
							onclick={() => (selectedQuestion = question)}
						>
							<div class="flex flex-row items-center gap-1.5 font-bold">
								<p class="text-muted-foreground">Q{index + 1}</p>
								<Badge variant="outline">{typeToBadge(question.type)}</Badge>
							</div>

							{#if question.prompt === ''}
								<p class="text-sm font-semibold text-muted-foreground">Keine Frage eingetragen</p>
							{:else}
								<p class="text-sm font-semibold">
									{question.prompt}
								</p>
							{/if}
						</button>
					{/each}
				</div>

				<!--
					<Field.Error>Mindestens eine Frage ist erforderlich.</Field.Error>
				-->

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" class="w-full" {...props}>
								<PlusIcon class="text-primary" />
								Frage hinzufügen
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item onclick={addMultipleChoiceQuestion}
								>Multiple Choice</DropdownMenu.Item
							>
							<DropdownMenu.Item onclick={addSingleChoiceQuestion}>Single Choice</DropdownMenu.Item>
							<DropdownMenu.Item onclick={addOpenTextQuestion}>Open Text</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			{#if selectedQuestion}
				<div class="col-span-2">
					<Card.Root>
						<Card.Content>
							<Field.Group>
								<div class="flex flex-col gap-5">
									<div class="flex flex-row items-center justify-between">
										<p class="text-muted-foreground">
											Frage {selectedQuestion.position + 1} von {quiz.questions.length}
										</p>
										<Button variant="ghost" onclick={() => removeQuestion(selectedQuestion!.id)}>
											<TrashIcon class="text-destructive" />
											Löschen
										</Button>
									</div>

									<Field.Field>
										<Field.Label for="prompt">Fragenstellung</Field.Label>
										<Textarea
											id="prompt"
											bind:value={selectedQuestion.prompt}
											placeholder={UUIDToPromptPlaceholder(selectedQuestion.id)}
										/>
										<!--
											<Field.Error>Die Fragenstellung darf nicht leer sein.</Field.Error>
										-->
									</Field.Field>

									{#if selectedQuestion.type === 'multiple'}
										<div class=" flex flex-col gap-3">
											<Label>Antworten</Label>

											{#each (selectedQuestion as MultipleChoiceQuestion).answers as answer, index (answer.id)}
												<div class="flex flex-row items-start gap-2">
													<Toggle
														bind:pressed={answer.is_correct}
														variant="outline"
														class="size-9 text-muted-foreground transition-all duration-200 data-[state=on]:border-green-500 data-[state=on]:bg-green-500/10 "
														>{indexToSequence(
															index,
															(selectedQuestion as MultipleChoiceQuestion).sequence_type
														)}</Toggle
													>

													<Field.Field>
														<Input
															type="text"
															placeholder={UUIDToAnswerPlaceholder(selectedQuestion.id)}
															bind:value={answer.text}
														/>
														<!--
															<Field.Error>Die Fragenstellung darf nicht leer sein.</Field.Error>
														-->
													</Field.Field>

													<Button
														variant="ghost"
														onclick={() =>
															removeAnswer(selectedQuestion as MultipleChoiceQuestion, answer.id)}
													>
														<XIcon class="text-destructive" />
													</Button>
												</div>
											{/each}
											<!--
												<Field.Error>Mindestens eine Antwort muss korrekt sein.</Field.Error>
											-->
											<Button variant="ghost" class="w-fit" onclick={addAnswerToSelectedQuestion}>
												<PlusIcon class="text-primary" />
												Antwort hinzufügen
											</Button>
										</div>
									{:else if selectedQuestion.type === 'single'}
										<div class=" flex flex-col gap-3">
											<Label>Antworten</Label>

											{#each (selectedQuestion as SingleChoiceQuestion).answers as answer, index (answer.id)}
												<div class="flex flex-row items-center gap-2">
													<Toggle
														onPressedChange={() =>
															(selectedQuestion as SingleChoiceQuestion).answers.forEach(
																(a) => (a.is_correct = a.id === answer.id)
															)}
														bind:pressed={answer.is_correct}
														variant="outline"
														class="size-9 text-muted-foreground transition-all duration-200 data-[state=on]:border-green-500 data-[state=on]:bg-green-500/10 "
														>{indexToSequence(
															index,
															(selectedQuestion as SingleChoiceQuestion).sequence_type
														)}</Toggle
													>

													<Input
														type="text"
														placeholder={UUIDToAnswerPlaceholder(selectedQuestion.id)}
														bind:value={answer.text}
													/>
													<Button
														variant="ghost"
														onclick={() =>
															removeAnswer(selectedQuestion as SingleChoiceQuestion, answer.id)}
													>
														<XIcon class="text-destructive" />
													</Button>
												</div>
											{/each}

											<Button variant="ghost" class="w-fit" onclick={addAnswerToSelectedQuestion}>
												<PlusIcon class="text-primary" />
												Antwort hinzufügen
											</Button>
										</div>
									{:else if selectedQuestion.type === 'open'}
										<div class=" flex flex-col gap-3">
											<Label for="keywords">Keywords</Label>

											<Input
												id="keywords"
												type="text"
												placeholder="Keyword eingeben und mit Enter bestätigen..."
												onkeydown={(event) =>
													onkeydown(event, selectedQuestion as OpenTextQuestion)}
												bind:value={keywordInputValue}
											/>

											<div class="flex flex-row items-center gap-2">
												{#each (selectedQuestion as OpenTextQuestion).keywords as keyword, index (index)}
													<Badge
														class="cursor-pointer"
														onclick={() =>
															(selectedQuestion as OpenTextQuestion).keywords.splice(index, 1)}
													>
														{keyword}
													</Badge>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</Field.Group>
						</Card.Content>
					</Card.Root>
				</div>

				<div class="flex flex-col gap-4">
					<Card.Root>
						<Card.Content>
							<div class="flex flex-col gap-5">
								<p class="text-muted-foreground">
									Einstellungen | {typeToBadge(selectedQuestion.type)}
								</p>

								<div class="flex flex-col gap-3">
									<Label for="prompt">Zeit</Label>
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
								</div>

								{#if selectedQuestion.type !== 'open'}
									<Separator />

									<div class="flex flex-col gap-3">
										<Label for="points">Sequenzierung</Label>
										<Select.Root
											type="single"
											bind:value={
												(selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion)
													.sequence_type
											}
										>
											<Select.Trigger class="w-full"
												>{sequenceTypeToString(
													(selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion)
														.sequence_type
												)}</Select.Trigger
											>
											<Select.Content>
												<Select.Item value="numeric">Numerisch</Select.Item>
												<Select.Item value="roman">Römisch</Select.Item>
												<Select.Item value="alphabetic">Alphabetisch</Select.Item>
											</Select.Content>
										</Select.Root>
									</div>
								{/if}

								<Separator />

								<div class="flex flex-col gap-3">
									<Label for="points">Punkte</Label>
									<Input id="points" type="number" min={0} bind:value={selectedQuestion.points} />
								</div>

								<Separator />

								<div class="flex flex-col gap-3">
									<Label for="points">Resultat nach Abgabe anzeigen</Label>
									<Tabs.Root value="no" class="w-full">
										<Tabs.List class="w-full">
											<Tabs.Trigger value="no">Nein</Tabs.Trigger>
											<Tabs.Trigger value="yes">Ja</Tabs.Trigger>
										</Tabs.List>
									</Tabs.Root>
								</div>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Content>
							<div class="flex flex-col gap-5">
								<p class="text-muted-foreground">Übersicht</p>

								<div class="flex flex-col gap-1">
									<div class="flex flex-row items-center justify-between">
										<p>Fragen</p>
										<p>{quiz.questions.length}</p>
									</div>

									<div class="flex flex-row items-center justify-between">
										<p>Gesch. Zeit</p>
										<p>{estTime}</p>
									</div>

									<div class="flex flex-row items-center justify-between">
										<p>Punkte</p>
										<p>{totalPoints}</p>
									</div>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{:else}
				<div class="col-span-3">
					<Card.Root>
						<Card.Content>
							<div class="flex flex-col items-center gap-2">
								<p class="text-xl font-semibold">Noch keine Fragen hinzugefügt</p>
								<p class="mb-2 text-muted-foreground">
									Füge eine neue Frage hinzu, um zu beginnen.
								</p>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button variant="default" {...props}>
												<PlusIcon />
												Frage hinzufügen
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Item onclick={addMultipleChoiceQuestion}
												>Multiple Choice</DropdownMenu.Item
											>
											<DropdownMenu.Item onclick={addSingleChoiceQuestion}>
												Single Choice
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={addOpenTextQuestion}>Open Text</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
		</div>
	</Field.Set>
</div>
