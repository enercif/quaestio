<script lang="ts">
	import LiveQuestionHeader from '$lib/components/quiz/live/live-question-header.svelte';
	import {
		evaluateAnswer,
		indexToSequence,
		remainingMs,
		resultClass
	} from '$lib/components/quiz/quiz.utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { submitAnswer } from '$live/rooms';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import SendIcon from '@lucide/svelte/icons/send';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { LiveStudentState, studentAnswersPersistedState } from './live-student.state.svelte';

	const live = LiveStudentState.get();

	const roomData = $derived(live.roomData!);
	const currentQuestion = $derived(roomData.current_question!);
	const revealed = $derived(roomData.state === 'answer');
	const correct = $derived(roomData.current_answers ?? []);
	const paused = $derived(roomData.paused_remaining != null);
	const timeUp = $derived(remainingMs(roomData) === 0);
	const locked = $derived(revealed || paused || timeUp);
	const selected = $derived(studentAnswersPersistedState.current.selected);
	const result = $derived(
		revealed ? evaluateAnswer(currentQuestion.type, correct, selected) : null
	);

	let openText = $state('');

	watch(
		() => currentQuestion.id,
		(questionId) => {
			if (questionId !== studentAnswersPersistedState.current.questionId) {
				studentAnswersPersistedState.current.questionId = questionId;
				studentAnswersPersistedState.current.selected = [];
			}
			openText = studentAnswersPersistedState.current.selected[0] ?? '';
		}
	);

	async function submit(newSelected: string[]) {
		studentAnswersPersistedState.current.selected = newSelected;
		try {
			await submitAnswer(live.roomId, newSelected);
		} catch {
			toast.error('Antwort konnte nicht gesendet werden.');
		}
	}

	function choose(answerId: string) {
		if (currentQuestion.type === 'single') {
			submit([answerId]);
		} else {
			submit(
				selected.includes(answerId)
					? selected.filter((id) => id !== answerId)
					: [...selected, answerId]
			);
		}
	}

	function answerTexts(ids: string[]) {
		if (currentQuestion.type === 'open') return ids.join(' / ');
		return currentQuestion.answers
			.filter((answer) => ids.includes(answer.id))
			.map((answer) => answer.text)
			.join(', ');
	}

	function revealClass(answerId: string) {
		if (correct.includes(answerId)) return resultClass.correct;
		if (selected.includes(answerId)) return resultClass.wrong;
		return 'opacity-60';
	}

	const rowClass = 'w-full flex items-center gap-4 rounded-lg border px-5 py-4';
</script>

<div class="px-10 mt-5 flex flex-col size-full max-w-6xl justify-start">
	<LiveQuestionHeader room={roomData} />

	<h1 class="text-3xl font-semibold mt-10">{currentQuestion.question}</h1>

	<div class="flex flex-col mt-5 justify-start relative">
		{#if !revealed && (paused || timeUp)}
			<div
				transition:fade={{ duration: 50 }}
				class="absolute inset-0 z-10 grid place-items-center backdrop-blur-xs font-medium"
			>
				<div class="flex flex-row items-center gap-2 w-fit bg-background/50 p-2 rounded-lg">
					{#if paused}
						<PauseIcon class="size-4" />
						Pausiert
					{:else}
						<ClockIcon class="size-4" />
						Zeit abgelaufen
					{/if}
				</div>
			</div>
		{/if}

		{#if currentQuestion.type === 'open'}
			{#if revealed}
				<div class="flex flex-col gap-4 w-full mt-5">
					<div class={[rowClass, resultClass.correct]}>
						<CheckIcon class="size-5 text-green-500" />
						{correct.join(' / ')}
					</div>

					{#if selected[0] && result !== 'correct'}
						<div class={[rowClass, resultClass.wrong]}>
							<XIcon class="size-5 text-destructive" />
							{selected[0]}
						</div>
					{/if}
				</div>
			{:else}
				<form
					class="flex flex-row gap-3 w-full mt-5"
					onsubmit={(event) => {
						event.preventDefault();
						if (openText.trim()) submit([openText.trim()]);
					}}
				>
					<Input placeholder="Deine Antwort…" bind:value={openText} disabled={locked} />
					<Button type="submit" disabled={locked || !openText.trim()}>
						<SendIcon />
						Senden
					</Button>
				</form>
				{#if selected[0]}
					<p class="mt-2 text-sm text-muted-foreground">Gesendet: {selected[0]}</p>
				{/if}
			{/if}
		{:else}
			<div class="flex flex-col gap-4 w-full mt-5">
				{#each currentQuestion.answers as answer, index (answer.id)}
					{@const isSelected = selected.includes(answer.id)}
					<button
						type="button"
						class={[
							rowClass,
							'justify-start transition duration-150',
							revealed
								? revealClass(answer.id)
								: [
										'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
										isSelected && 'border-primary bg-primary/5'
									]
						]}
						disabled={locked}
						aria-pressed={isSelected}
						onclick={() => choose(answer.id)}
					>
						<div
							class={[
								'size-10 border grid place-items-center rounded-md transition-colors duration-150',
								!revealed && isSelected && 'bg-primary text-primary-foreground border-primary'
							]}
						>
							{indexToSequence(index, currentQuestion.sequence_type)}
						</div>

						{answer.text}

						{#if revealed && correct.includes(answer.id)}
							<CheckIcon class="ml-auto size-5 text-green-500" />
						{:else if revealed && isSelected}
							<XIcon class="ml-auto size-5 text-destructive" />
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if revealed}
			<div
				class={[
					'mt-10 rounded-lg border px-5 py-4 flex flex-row items-center gap-4',
					result === 'correct' && 'border-green-500 bg-green-500/10 text-green-600',
					result === 'partial' && 'border-yellow-500 bg-yellow-500/10 text-yellow-600',
					result === 'wrong' && 'border-destructive bg-destructive/10 text-destructive'
				]}
			>
				{#if result === 'correct'}
					<CheckIcon class="size-5" />
					Richtige Antwort!
				{:else}
					<div
						class={[
							'size-10 text-primary-foreground rounded-lg grid place-items-center',
							result === 'partial' ? 'bg-yellow-500' : 'bg-destructive'
						]}
					>
						{#if result === 'partial'}
							<TriangleAlertIcon />
						{:else}
							<XIcon />
						{/if}
					</div>
					<div class="flex flex-col">
						<span class="font-semibold">
							{result === 'partial' ? 'Teilweise richtig' : 'Falsche Antwort'}
						</span>
						<span>
							Deine Antwort: {answerTexts(selected) || 'Keine'} | Richtig: {answerTexts(correct)}
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
