<script lang="ts">
	import CodeLines from '$lib/components/quiz/code-lines.svelte';
	import LiveQuestionHeader from '$lib/components/quiz/live/live-question-header.svelte';
	import QuizControls from '$lib/components/quiz/quiz-controls.svelte';
	import { evaluateAnswer, indexToSequence, resultClass } from '$lib/components/quiz/quiz.utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { SvelteMap } from 'svelte/reactivity';
	import { liveTeacherContext } from './live-teacher.state.svelte';

	const live = liveTeacherContext.get();

	const roomData = $derived(live.roomData!);
	const currentQuestion = $derived(roomData.current_question!);
	const revealed = $derived(live.revealed);
	const correct = $derived(roomData.current_answers ?? []);

	const answers = $derived(live.answers.filter((a) => a.question_id === currentQuestion.id));
	const answersByStudent = $derived(new Map(answers.map((a) => [a.student_id, a.selected])));
	const answeredCount = $derived(answers.filter((a) => a.selected.length > 0).length);

	const counts = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const a of answers) for (const v of a.selected) if (v) map.set(v, (map.get(v) ?? 0) + 1);
		return map;
	});
	const openCounts = $derived([...counts].sort((a, b) => b[1] - a[1]));

	function pctFor(answer: string) {
		return answeredCount ? Math.round(((counts.get(answer) ?? 0) / answeredCount) * 100) : 0;
	}

	function studentClass(selected: string[]) {
		if (!revealed) {
			return selected.length > 0 ? 'border-primary bg-primary/5' : 'bg-secondary';
		}
		return resultClass[evaluateAnswer(currentQuestion.type, correct, selected)];
	}
</script>

<div class="flex flex-col">
	<LiveQuestionHeader room={roomData}>
		{#snippet actions()}
			{#if live.isRoomOwner}
				<QuizControls flow={live} />
			{/if}
		{/snippet}
	</LiveQuestionHeader>

	<h1 class="text-3xl font-semibold mt-10">{currentQuestion.question}</h1>

	<div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Antworten</Card.Title>
				<Card.Description>
					{answeredCount} von {live.studentPresence.length} haben geantwortet
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				{#if currentQuestion.type === 'open'}
					{#each openCounts as [text, count] (text)}
						<div
							class={[
								'flex flex-row items-center justify-between rounded-lg border px-4 py-3',
								revealed && resultClass[evaluateAnswer('open', correct, [text])]
							]}
						>
							<span>{text}</span>
							<span class="text-sm text-muted-foreground">{count}×</span>
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">Noch keine Antworten.</p>
					{/each}
				{:else if currentQuestion.type === 'programming'}
					<CodeLines
						code={currentQuestion.code}
						language={currentQuestion.language}
						votes={counts}
						lineState={(line) => (revealed && correct.includes(line) ? 'correct' : undefined)}
					/>
				{:else}
					{#each currentQuestion.answers as answer, index (answer.text)}
						{@const isCorrect = revealed && correct.includes(answer.text)}
						<div
							class={[
								'relative overflow-hidden rounded-lg border px-4 py-3',
								isCorrect && 'border-green-500'
							]}
						>
							<div
								class={[
									'absolute inset-y-0 left-0 transition-[width] duration-300',
									isCorrect ? 'bg-green-500/15' : 'bg-primary/10'
								]}
								style:width="{pctFor(answer.text)}%"
							></div>

							<div class="relative flex flex-row items-center gap-3">
								<div class="size-8 shrink-0 border grid place-items-center rounded-md text-sm">
									{indexToSequence(index, currentQuestion.sequence_type)}
								</div>
								<span class="grow">{answer.text}</span>
								{#if isCorrect}
									<CheckIcon class="size-5 shrink-0 text-green-500" />
								{/if}
								<span class="shrink-0 text-sm text-muted-foreground tabular-nums">
									{counts.get(answer.text) ?? 0} · {pctFor(answer.text)}%
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Studenten</Card.Title>
				<Card.Description>{live.studentPresence.length} im Raum</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-row flex-wrap gap-3">
					{#each live.studentPresence as presence (presence.key)}
						{@const selected = answersByStudent.get(presence.key) ?? []}
						<div
							class={[
								'flex flex-row items-center gap-2 rounded-3xl border px-3 py-1 transition-colors',
								studentClass(selected)
							]}
						>
							<div class="p-1 text-xs font-semibold">
								{presence.data.name.slice(0, 2).toUpperCase()}
							</div>
							<span class="text-xs">{presence.data.name}</span>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
