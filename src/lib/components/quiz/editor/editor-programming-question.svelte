<script lang="ts">
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import type { ProgrammingQuestion } from '$lib/schemas/question.schema';
	import { highlightCode, programmingLanguages } from '$lib/shiki';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { UUIDToPromptPlaceholder } from './editor-utils';
	import { EditorState } from './editor.state.svelte';

	const editor = EditorState.get();
	const selectedQuestion = $derived(editor.selectedQuestion as ProgrammingQuestion);
	const promptError = $derived(editor.getSelectedQuestionError('question'));
	const languageError = $derived(editor.getSelectedQuestionError('language'));
	const codeError = $derived(editor.getSelectedQuestionError('code'));
	const correctError = $derived(editor.getSelectedQuestionError('correct'));
	const reasonsError = $derived(editor.getSelectedQuestionError('reasons'));

	let html = $derived.by(async () => {
		const code = selectedQuestion.code;
		const lang = selectedQuestion.language;
		if (!code || !lang) return '';
		return highlightCode(code, lang);
	});

	onMount(() => {
		for (const lineSpan of document.querySelectorAll<HTMLElement>('.line[data-line]')) {
			const lineNumber = lineSpan.dataset.line!;
			lineSpan.classList.toggle('wrong-line', selectedQuestion.correct.includes(lineNumber));
		}
	});

	function toggleLine(lineNumber: string) {
		const lineSpan = document.querySelector<HTMLElement>(".line[data-line='" + lineNumber + "']");
		if (!lineSpan) return;

		if (selectedQuestion.correct.includes(lineNumber)) {
			selectedQuestion.correct = selectedQuestion.correct.filter((line) => line !== lineNumber);
			delete selectedQuestion.reasons[lineNumber];
			lineSpan.classList.remove('wrong-line');
		} else {
			selectedQuestion.correct.push(lineNumber);
			selectedQuestion.correct.sort((a, b) => parseInt(a) - parseInt(b));
			selectedQuestion.reasons[lineNumber] = '';
			lineSpan.classList.add('wrong-line');
		}
	}

	function onCodeClick(event: MouseEvent) {
		const line = (event.target as HTMLElement).closest<HTMLElement>('.line');
		if (!line?.dataset.line) return;
		toggleLine(line.dataset.line!);
	}
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

<Field.Field aria-invalid={!!languageError}>
	<Field.Label for="language">Sprache</Field.Label>
	<Combobox
		id="language"
		options={programmingLanguages}
		bind:value={selectedQuestion.language}
		placeholder="Sprache auswählen..."
		empty="Keine Sprache gefunden."
	/>
	{#each languageError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}
</Field.Field>

<Field.Field aria-invalid={!!codeError}>
	<Field.Label for="code">Code</Field.Label>

	<Textarea
		id="code"
		bind:value={selectedQuestion.code}
		class="min-h-30 font-mono"
		placeholder="Code hier eingeben..."
		aria-invalid={!!codeError}
	/>
	{#each codeError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}
</Field.Field>

<Field.Separator class="-my-5 mx-20" />

<div class="flex flex-col gap-2">
	<div
		onclick={onCodeClick}
		role="presentation"
		class="programming-code-preview overflow-x-auto rounded-md border text-sm [&_code]:py-3"
	>
		{#if !selectedQuestion.code || !selectedQuestion.language}
			<p class="p-3 text-muted-foreground">
				Wähle eine Sprache und gib Code ein, um die Vorschau zu sehen.
			</p>
		{:else}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html await html}
		{/if}
	</div>

	{#each correctError as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}
</div>

{#if selectedQuestion.correct.length > 0}
	<div class="flex flex-col gap-3">
		<Field.Label>Begründungen (optional)</Field.Label>
		{#each reasonsError as error, i (i)}
			<Field.Error>{error}</Field.Error>
		{/each}
		<div class="flex flex-col gap-4">
			{#each selectedQuestion.correct as lineNumber (lineNumber)}
				<div class="flex flex-row items-start gap-2" transition:fade={{ duration: 150 }}>
					<Toggle disabled class="size-9 disabled:opacity-100" variant="outline"
						>{lineNumber}</Toggle
					>
					<Textarea
						class="grow w-full"
						id={`reason-${lineNumber}`}
						bind:value={selectedQuestion.reasons[lineNumber]}
						placeholder="Warum ist Zeile {lineNumber} falsch?"
					/>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.programming-code-preview :global(.line.wrong-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--destructive) 12%, transparent);
	}
</style>
