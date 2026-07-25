<script lang="ts">
	import CodeLines from '$lib/components/quiz/code-lines.svelte';
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import type { ProgrammingQuestion } from '$lib/schemas/question.schema';
	import { programmingLanguages } from '$lib/shiki';
	import { fade } from 'svelte/transition';
	import FieldErrors from './editor-field-errors.svelte';
	import { UUIDToPromptPlaceholder } from './editor-utils';
	import { EditorState } from './editor.state.svelte';

	const editor = EditorState.get();
	const selectedQuestion = $derived(editor.selectedQuestion as ProgrammingQuestion);
	const promptError = $derived(editor.getSelectedQuestionError('question'));
	const languageError = $derived(editor.getSelectedQuestionError('language'));
	const codeError = $derived(editor.getSelectedQuestionError('code'));
	const correctError = $derived(editor.getSelectedQuestionError('correct'));
	const reasonsError = $derived(editor.getSelectedQuestionError('reasons'));

	function toggleLine(lineNumber: string) {
		if (selectedQuestion.correct.includes(lineNumber)) {
			selectedQuestion.correct = selectedQuestion.correct.filter((line) => line !== lineNumber);
			delete selectedQuestion.reasons[lineNumber];
			delete selectedQuestion.partial_points[lineNumber];
		} else {
			selectedQuestion.correct.push(lineNumber);
			selectedQuestion.correct.sort((a, b) => parseInt(a) - parseInt(b));
			selectedQuestion.reasons[lineNumber] = '';
			selectedQuestion.partial_points[lineNumber] = 1;
		}
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
	<FieldErrors errors={promptError} />
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
	<FieldErrors errors={languageError} />
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
	<FieldErrors errors={codeError} />
</Field.Field>

<Field.Separator class="-my-5 mx-20" />

<div class="flex flex-col gap-2">
	<CodeLines
		code={selectedQuestion.code}
		language={selectedQuestion.language}
		lineState={(line) => (selectedQuestion.correct.includes(line) ? 'wrong' : undefined)}
		onLineClick={toggleLine}
	>
		{#snippet empty()}
			<p class="p-3 text-muted-foreground">
				Wähle eine Sprache und gib Code ein, um die Vorschau zu sehen.
			</p>
		{/snippet}
	</CodeLines>

	<FieldErrors errors={correctError} />
</div>

{#if selectedQuestion.correct.length > 0}
	<div class="flex flex-col gap-3">
		<Field.Label>Begründungen (optional)</Field.Label>
		<FieldErrors errors={reasonsError} />
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
