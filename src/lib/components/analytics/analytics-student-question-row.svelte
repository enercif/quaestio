<script lang="ts">
	import { typeToBadge } from '$lib/components/quiz/quiz.utils';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { setPointsOverride } from '$lib/remote/analytics.remote';
	import type { AnalyticsQuizQuestion } from '$lib/schemas/analytics.schema';
	import type { AnalyticsQuestion } from '$lib/types/analytics.type';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import { toast } from 'svelte-sonner';
	import { correctToArray } from './analytics.utils';

	interface Props {
		question: AnalyticsQuestion;
		currentQuestion: AnalyticsQuizQuestion;
	}
	let { question, currentQuestion }: Props = $props();

	const correct = $derived(correctToArray(currentQuestion));

	let editing = $state(false);
	// draft is reset from `points` in startEdit()
	// svelte-ignore state_referenced_locally
	let draft = $state(question.achievedPoints);

	function startEdit() {
		draft = question.achievedPoints;
		editing = true;
	}

	async function save() {
		if (question.answerId === undefined) {
			toast.error('Antwort konnte nicht gefunden werden.');
			editing = false;
			return;
		}
		const result = await setPointsOverride({ answerId: question.answerId, points: draft });
		if (!result.success) toast.error('Punkte konnten nicht gespeichert werden.');
		editing = false;
	}

	async function reset() {
		if (question.answerId === undefined) {
			toast.error('Antwort konnte nicht gefunden werden.');
			editing = false;
			return;
		}
		const result = await setPointsOverride({ answerId: question.answerId, points: null });
		if (!result.success) toast.error('Punkte konnten nicht zurückgesetzt werden.');
		editing = false;
	}
</script>

<div class="flex flex-row items-start gap-3 rounded-md border px-3 py-2">
	<div class="flex grow flex-col gap-1">
		<div class="flex flex-col gap-2">
			<div class="flex flex-row items-center gap-2">
				<span class="text-sm text-muted-foreground">Frage {currentQuestion.position + 1}</span>
				<Badge variant="secondary">{typeToBadge(currentQuestion.type)}</Badge>
			</div>
			<span class="text-sm font-medium">{currentQuestion.question}</span>
		</div>

		<p class="text-sm text-muted-foreground">
			Gesucht: {correct.length > 0 ? correct.join(', ') : '—'}
		</p>

		<p class="text-sm text-muted-foreground">
			Antwort:
			{#if question.selected.length > 0}
				{question.selected.join(', ')}
			{:else}
				<span class="text-destructive">Keine Antwort</span>
			{/if}
		</p>
	</div>

	<div class="flex shrink-0 flex-row items-center gap-2">
		{#if editing}
			<Input type="number" min="0" max={question.maxPoints} class="w-20" bind:value={draft} />
			<Button size="sm" onclick={save}>Speichern</Button>
			<Button size="sm" variant="ghost" onclick={() => (editing = false)}>Abbrechen</Button>
		{:else}
			<span class="text-sm tabular-nums">{question.achievedPoints} / {question.maxPoints}</span>
			{#if question.answerId}
				<Button size="icon" variant="ghost" onclick={startEdit}>
					<PencilIcon />
				</Button>
				{#if question.overridden}
					<Button size="icon" variant="ghost" onclick={reset}>
						<RotateCcwIcon />
					</Button>
				{/if}
			{/if}
		{/if}
	</div>
</div>
