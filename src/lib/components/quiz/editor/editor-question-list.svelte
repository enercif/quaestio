<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { typeToBadge } from '../quiz.utils';
	import EditorQuestionDropdown from './editor-question-dropdown.svelte';
	import { EditorState } from './editor.state.svelte';

	const state = EditorState.get();
</script>

<div class="flex flex-col gap-2 text-xs">
	<div class="flex flex-row justify-between text-muted-foreground">
		<p class="tracking-wide uppercase">Fragen</p>
		<p>{state.quiz.questions.length}</p>
	</div>

	{#each state.getQuizError('questions') as error, i (i)}
		<Field.Error>{error}</Field.Error>
	{/each}

	<div class="my-2 flex flex-col gap-2">
		{#each state.quiz.questions as question, index (question.id)}
			{@const hasError = state.hasQuestionError(index)}
			<button
				class="flex cursor-pointer flex-col gap-2 rounded-md border px-3 py-2.5 text-start transition-all duration-150 {state.selectedId ===
				question.id
					? 'border-primary bg-primary/3'
					: ''}"
				onclick={() => (state.selectedId = question.id)}
			>
				<div class="flex flex-row items-center gap-1.5 font-bold">
					<p class="text-muted-foreground">Q{index + 1}</p>
					<Badge variant="outline">{typeToBadge(question.type)}</Badge>

					{#if hasError}
						<TriangleAlert class="ml-auto size-4 text-destructive" />
					{/if}
				</div>

				{#if question.question === ''}
					<p class="text-sm font-semibold text-muted-foreground">Keine Frage eingetragen</p>
				{:else}
					<p class="text-sm font-semibold">
						{question.question}
					</p>
				{/if}
			</button>
		{/each}
	</div>

	<EditorQuestionDropdown>
		{#snippet trigger({ props })}
			<Button variant="outline" class="w-full" {...props}>
				<PlusIcon class="text-primary" />
				Frage hinzufügen
			</Button>
		{/snippet}
	</EditorQuestionDropdown>
</div>
