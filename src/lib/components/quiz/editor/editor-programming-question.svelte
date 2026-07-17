<script lang="ts">
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { ProgrammingQuestion } from '$lib/schemas/question.schema';
	import { highlightCode, programmingLanguages } from '$lib/shiki';
	import { watch } from 'runed';
	import { UUIDToPromptPlaceholder } from './editor-utils';
	import { EditorState } from './editor.state.svelte';

	const editor = EditorState.get();
	const selectedQuestion = $derived(editor.selectedQuestion as ProgrammingQuestion);
	const promptError = $derived(editor.getSelectedQuestionError('question'));
	const languageError = $derived(editor.getSelectedQuestionError('language'));
	const codeError = $derived(editor.getSelectedQuestionError('code_snippet'));
	const linesError = $derived(editor.getSelectedQuestionError('correct_lines'));
	const reasonsError = $derived(editor.getSelectedQuestionError('reasons'));

	let codeContainer: HTMLDivElement | undefined = $state();
	let html = $derived.by(async () => {
		const code = selectedQuestion.code_snippet;
		const lang = selectedQuestion.language;
		if (!code || !lang) return '';
		return highlightCode(code, lang);
	});

	watch(
		() => selectedQuestion.correct_lines,
		(correctLines) => {
			if (!codeContainer) return;
			for (const line of codeContainer.querySelectorAll<HTMLElement>('.line')) {
				const lineNumber = Number(line.dataset.line);
				line.classList.toggle('wrong-line', correctLines.includes(lineNumber));
			}
		}
	);

	function toggleLine(lineNumber: number) {
		if (selectedQuestion.correct_lines.includes(lineNumber)) {
			selectedQuestion.correct_lines = selectedQuestion.correct_lines.filter(
				(line) => line !== lineNumber
			);
			delete selectedQuestion.reasons[lineNumber];
		} else {
			selectedQuestion.correct_lines = [...selectedQuestion.correct_lines, lineNumber].sort(
				(a, b) => a - b
			);
			selectedQuestion.reasons[lineNumber] ??= '';
		}
	}

	function onCodeClick(event: MouseEvent) {
		const line = (event.target as HTMLElement).closest<HTMLElement>('.line');
		if (!line?.dataset.line) return;
		toggleLine(Number(line.dataset.line));
	}
</script>

<Field.Group>
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
			bind:value={selectedQuestion.code_snippet}
			class="min-h-30 font-mono"
			placeholder="Code hier eingeben..."
			aria-invalid={!!codeError}
		/>
		{#each codeError as error, i (i)}
			<Field.Error>{error}</Field.Error>
		{/each}
	</Field.Field>

	<Field.Separator />

	<div class="flex flex-col gap-2">
		<div
			bind:this={codeContainer}
			onclick={onCodeClick}
			role="presentation"
			class="programming-code-preview overflow-x-auto rounded-md border text-sm [&_code]:py-3"
		>
			{#if !selectedQuestion.code_snippet || !selectedQuestion.language}
				<p class="p-3 text-muted-foreground">
					Wähle eine Sprache und gib Code ein, um die Vorschau zu sehen.
				</p>
			{:else}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html await html}
			{/if}
		</div>

		{#each linesError as error, i (i)}
			<Field.Error>{error}</Field.Error>
		{/each}
	</div>

	{#if selectedQuestion.correct_lines.length > 0}
		<div class="flex flex-col gap-3">
			<Field.Legend>Begründungen</Field.Legend>
			{#each selectedQuestion.correct_lines as lineNumber (lineNumber)}
				<Field.Field>
					<Field.Label for={`reason-${lineNumber}`}>Zeile {lineNumber}</Field.Label>
					<Textarea
						id={`reason-${lineNumber}`}
						bind:value={selectedQuestion.reasons[lineNumber]}
						placeholder="Warum ist diese Zeile falsch?"
					/>
				</Field.Field>
			{/each}

			{#each reasonsError as error, i (i)}
				<Field.Error>{error}</Field.Error>
			{/each}
		</div>
	{/if}

	<Field.Field>
		<Field.Label for="hint">Hinweis (optional)</Field.Label>
		<Textarea id="hint" bind:value={selectedQuestion.hint} placeholder="Optionaler Hinweis..." />
	</Field.Field>
</Field.Group>

<style>
	.programming-code-preview :global(.line:hover) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--foreground) 6%, transparent);
	}

	.programming-code-preview :global(.line::before) {
		content: attr(data-line);
		color: var(--muted-foreground);
		padding-inline: 0.75rem;
	}

	.programming-code-preview :global(.line.wrong-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--destructive) 12%, transparent);
	}

	.programming-code-preview :global(.line:hover span),
	.programming-code-preview :global(.line.wrong-line span) {
		background-color: transparent !important;
	}

	.programming-code-preview :global(code) {
		display: grid;
	}
</style>
