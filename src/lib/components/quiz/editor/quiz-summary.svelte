<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { getQuizEditorState } from './quiz-editor-state.svelte';

	const state = getQuizEditorState();
</script>

<Card.Root>
	<Card.Content>
		<div class="flex flex-col gap-5">
			<p class="text-muted-foreground">Übersicht</p>

			<div class="flex flex-col gap-1">
				<div class="flex flex-row items-center justify-between">
					<p>Fragen</p>
					<p>{state.quiz.questions.length}</p>
				</div>

				<div class="flex flex-row items-center justify-between">
					<p>Gesch. Zeit</p>
					<p>{state.estTime}</p>
				</div>

				<div class="flex flex-row items-center justify-between">
					<p>Punkte</p>
					<p>{state.totalPoints}</p>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
