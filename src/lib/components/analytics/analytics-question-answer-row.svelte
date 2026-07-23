<script lang="ts">
	import { typeToBadge } from '$lib/components/quiz/quiz.utils';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { setPointsOverride } from '$lib/remote/analytics.remote';
	import type { QuestionType } from '$lib/schemas/question.schema';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import { toast } from 'svelte-sonner';

	interface Props {
		index: number;
		question: {
			answerId: string | undefined;
			question: string;
			type: QuestionType;
			correct: string[];
			selected: string[];
			points: number;
			maxPoints: number;
			overridden: boolean;
		};
	}
	let { index, question: q }: Props = $props();

	let editing = $state(false);
	// draft is reset from `points` in startEdit()
	// svelte-ignore state_referenced_locally
	let draft = $state(q.points);

	function startEdit() {
		draft = q.points;
		editing = true;
	}

	async function save() {
		const result = await setPointsOverride({ answerId: q.answerId!, points: draft });
		if (!result.success) toast.error('Punkte konnten nicht gespeichert werden.');
		editing = false;
	}

	async function reset() {
		const result = await setPointsOverride({ answerId: q.answerId!, points: null });
		if (!result.success) toast.error('Punkte konnten nicht zurückgesetzt werden.');
		editing = false;
	}
</script>

<div class="flex flex-row items-start gap-3 rounded-md border px-3 py-2">
	<div class="flex grow flex-col gap-1">
		<div class="flex flex-col gap-2">
			<div class="flex flex-row items-center gap-2">
				<span class="text-sm text-muted-foreground">Frage {index + 1}</span>
				<Badge variant="secondary">{typeToBadge(q.type)}</Badge>
			</div>
			<span class="text-sm font-medium">{q.question}</span>
		</div>

		<p class="text-sm text-muted-foreground">
			Gesucht: {q.correct.length > 0 ? q.correct.join(', ') : '—'}
		</p>

		<p class="text-sm text-muted-foreground">
			Antwort: {q.selected.length > 0 ? q.selected.join(', ') : '—'}
		</p>
	</div>

	<div class="flex shrink-0 flex-row items-center gap-2">
		{#if editing}
			<Input type="number" min="0" max={q.maxPoints} class="w-20" bind:value={draft} />
			<Button size="sm" onclick={save}>Speichern</Button>
			<Button size="sm" variant="ghost" onclick={() => (editing = false)}>Abbrechen</Button>
		{:else}
			<span class="text-sm tabular-nums">{q.points} / {q.maxPoints}</span>
			{#if q.answerId}
				<Button size="icon" variant="ghost" onclick={startEdit}>
					<PencilIcon />
				</Button>
				{#if q.overridden}
					<Button size="icon" variant="ghost" onclick={reset}>
						<RotateCcwIcon />
					</Button>
				{/if}
			{/if}
		{/if}
	</div>
</div>
