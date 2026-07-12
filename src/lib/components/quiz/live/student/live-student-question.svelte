<script lang="ts">
	import ClockIcon from '@lucide/svelte/icons/clock';
	import { Checkbox } from 'bits-ui';
	import { onMount } from 'svelte';
	import { indexToSequence } from '../../editor/quiz-editor-utils';
	import { LiveStudentState, mcAnswersPersistedState } from './live-student.state.svelte';

	const live = LiveStudentState.get();

	const roomData = $derived(live.roomData!);
	const currentQuestion = $derived(roomData.current_question!);

	onMount(() => {
		if (currentQuestion.id !== mcAnswersPersistedState.current.questionId) {
			mcAnswersPersistedState.current.questionId = currentQuestion.id;
			mcAnswersPersistedState.current.selected = [];
		}
	});

	function onCheckedChange(checked: boolean, answerId: string) {
		if (checked) {
			mcAnswersPersistedState.current.selected = [
				...mcAnswersPersistedState.current.selected,
				answerId
			];
		} else {
			mcAnswersPersistedState.current.selected = mcAnswersPersistedState.current.selected.filter(
				(id) => id !== answerId
			);
		}
	}
</script>

<div class="px-10 mt-5 flex flex-col size-full max-w-6xl justify-start">
	<div class="w-full flex flex-col gap-2">
		<div class="w-full flex flex-row justify-between">
			<p>Frage {currentQuestion.position + 1} von {roomData.quiz.questions_length}</p>
			<div class="flex flex-row items-center gap-1">
				<ClockIcon class="size-4" />
				<p>30s</p>
			</div>
		</div>

		<div class="flex flex-row gap-4">
			{#each new Array(roomData.quiz.questions_length), i}
				{#if i <= currentQuestion.position}
					<div class="grow h-1 rounded-lg bg-primary"></div>
				{:else}
					<div class="grow h-1 rounded-lg bg-muted"></div>
				{/if}
			{/each}
		</div>
	</div>

	<h1 class="text-3xl font-semibold mt-10">{currentQuestion.question}</h1>

	{#if currentQuestion.type === 'multiple'}
		<div class="flex flex-col gap-4 w-full mt-5">
			{#each currentQuestion.answers as answer, index (answer.id)}
				<Checkbox.Root
					class="w-full border justify-start flex px-5 py-4 rounded-lg items-center gap-4 cursor-pointer data-checked:border-primary data-checked:bg-primary/5 transition duration-150"
					onCheckedChange={(checked) => {
						onCheckedChange(checked, answer.id);
					}}
					checked={mcAnswersPersistedState.current.selected.includes(answer.id)}
				>
					{#snippet children({ checked })}
						<div
							class={[
								'size-10 border grid place-items-center rounded-md transition-colors duration-150 ',
								checked && 'bg-primary text-primary-foreground border-primary'
							]}
						>
							{indexToSequence(index, currentQuestion.sequence_type)}
						</div>

						{answer.text}
					{/snippet}
				</Checkbox.Root>
			{/each}
		</div>
	{/if}
</div>
