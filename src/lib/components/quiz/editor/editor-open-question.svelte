<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { OpenTextQuestion } from '$lib/schemas/question.schema';
	import FieldErrors from './editor-field-errors.svelte';
	import { UUIDToPromptPlaceholder } from './editor-utils';
	import { EditorState } from './editor.state.svelte';

	const editor = EditorState.get();
	const selectedQuestion = $derived(editor.selectedQuestion as OpenTextQuestion);
	const promptError = $derived(editor.getSelectedQuestionError('question'));
	const keywordsError = $derived(editor.getSelectedQuestionError('correct'));

	let keywordInput = $state('');

	function onKeywordKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		const trimmed = keywordInput.trim();
		if (trimmed) {
			selectedQuestion.correct.push(trimmed);
			keywordInput = '';
		}
	}

	function getReasonPlaceholder() {
		switch (selectedQuestion.correct.length) {
			case 0:
				return 'Warum ist die Antwort korrekt?';
			case 1:
				return `Warum ist "${selectedQuestion.correct[0]}" das richtige Keyword?`;
			default:
				return `Warum sind "${selectedQuestion.correct.join(', ')}" die richtigen Keywords?`;
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

<div class=" flex flex-col gap-3">
	<Label for="keywords">Keywords</Label>

	<Input
		id="keywords"
		type="text"
		placeholder="Keyword eingeben und mit Enter bestätigen..."
		onkeydown={onKeywordKeydown}
		bind:value={keywordInput}
		aria-invalid={!!keywordsError}
	/>

	<div class="flex flex-row items-center gap-2">
		{#each selectedQuestion.correct as keyword, index (index)}
			<Badge class="cursor-pointer" onclick={() => selectedQuestion.correct.splice(index, 1)}>
				{keyword}
			</Badge>
		{/each}
	</div>

	<FieldErrors errors={keywordsError} />
</div>

<Field.Field>
	<Field.Label for="reason">Begründung (optional)</Field.Label>
	<Textarea
		id="reason"
		placeholder={getReasonPlaceholder()}
		bind:value={selectedQuestion.reasons}
	/>
</Field.Field>
