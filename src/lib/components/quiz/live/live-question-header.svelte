<script lang="ts">
	import { formatRemaining, remainingMs } from '$lib/components/quiz/quiz.utils';
	import type { PracticeRoom } from '$lib/types/practice-room.type';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import type { Snippet } from 'svelte';

	let { room, actions }: { room: PracticeRoom; actions?: Snippet } = $props();

	const question = $derived(room.current_question!);
	const remaining = $derived(remainingMs(room));
	const progress = $derived(
		remaining != null ? Math.min(1, 1 - remaining / (question.timelimit * 1000)) : 0
	);
</script>

<div class="w-full flex flex-col gap-2">
	<div class="w-full flex flex-col items-center justify-between gap-4 sm:flex-row">
		<p>Frage {question.position + 1} von {room.quiz.questions_length}</p>

		<div class="flex flex-row items-center gap-3">
			{#if remaining != null}
				<div
					class={[
						'flex flex-row items-center gap-1 font-medium tabular-nums transition-colors duration-150',
						remaining < 5000 && 'text-destructive'
					]}
				>
					<ClockIcon class="size-4" />
					<p>{formatRemaining(remaining)}</p>
				</div>
			{/if}
			{@render actions?.()}
		</div>
	</div>

	<div class="flex flex-row gap-4">
		{#each new Array(room.quiz.questions_length), i}
			<div class="grow h-1 rounded-lg bg-muted overflow-hidden relative">
				{#if remaining != null}
					{#if i < question.position}
						<div class="h-full w-full rounded-lg bg-primary"></div>
					{:else if i === question.position}
						<div class="h-full w-full rounded-lg bg-primary/10"></div>
						<div
							class={[
								'h-full rounded-lg transition-[width] absolute left-0 top-0 duration-300 ease-linear z-10',
								remaining < 5000 && 'bg-destructive',
								remaining >= 5000 && 'bg-primary'
							]}
							style:width="{progress * 100}%"
						></div>
					{/if}
				{:else}
					{#if i <= question.position}
						<div class="h-full w-full rounded-lg bg-primary"></div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</div>
