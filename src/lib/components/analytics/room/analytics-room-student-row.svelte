<script lang="ts">
	import AnalyticsStudentQuestionRow from '$lib/components/analytics/analytics-student-question-row.svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { slide } from 'svelte/transition';
	import { analyticsRoomContext, type AnalyticsRoomState } from './analytics-room.state.svelte';

	interface Props {
		student: (typeof AnalyticsRoomState.prototype.students)[number];
	}

	let { student }: Props = $props();

	const ctx = analyticsRoomContext.get();

	let isOpen = $state(false);
	const accuracy = $derived(ctx.maxPoints > 0 ? (student.totalPoints / ctx.maxPoints) * 100 : 0);
</script>

<div class="rounded-lg border">
	<button
		class="flex w-full flex-row items-center gap-3 px-4 py-3 text-left"
		onclick={() => (isOpen = !isOpen)}
	>
		<ChevronRightIcon
			class={[
				'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
				isOpen && 'rotate-90'
			]}
		/>
		<span class="font-medium">{student.name}</span>
		<span class="ml-auto text-sm tabular-nums text-muted-foreground">
			{student.totalPoints} / {ctx.maxPoints} Punkte
		</span>
		<Progress value={accuracy} class="h-2 w-32" />
	</button>

	{#if isOpen}
		<div class="flex flex-col gap-2 border-t px-4 py-3" transition:slide={{ duration: 150 }}>
			{#each student.questions as question (question.id)}
				{@const currentQuestion = ctx.quiz.questions.find((q) => q.id === question.id)!}
				<AnalyticsStudentQuestionRow {question} {currentQuestion} />
			{/each}
		</div>
	{/if}
</div>
