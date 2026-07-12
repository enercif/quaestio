<script lang="ts">
	import { resolve } from '$app/paths';
	import LaunchDialog from '$lib/components/quiz/launch-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import SaveIcon from '@lucide/svelte/icons/save';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { getQuizEditorState } from './quiz-editor-state.svelte';

	const state = getQuizEditorState();
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" href={resolve('/teacher/quizzes')}>
			<ArrowLeftIcon />
			Back
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{state.quiz.title}
		</h1>

		<div class="ml-auto flex flex-row items-center gap-3">
			{#if state.quizId}
				<Button variant="destructive" onclick={() => state.remove()}>
					<TrashIcon />
					Löschen
				</Button>
			{/if}

			<Button variant="ghost">
				<EyeIcon />
				Übersicht
			</Button>

			<Button variant="secondary" onclick={() => state.save()} disabled={!state.hasChanges}>
				<SaveIcon />

				Speichern
			</Button>
			<LaunchDialog
				quiz={{ ...state.quiz, id: state.quizId! }}
				label="Starte Quiz"
				preOpenCallback={() => state.preOpenCallback()}
			/>
		</div>
	</div>
</div>
