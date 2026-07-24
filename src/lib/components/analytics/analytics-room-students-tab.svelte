<script lang="ts">
	import AnalyticsQuestionAnswerRow from '$lib/components/analytics/analytics-question-answer-row.svelte';
	import type { QuestionResult } from '$lib/components/analytics/analytics.utils';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';

	interface Props {
		students: {
			studentId: string;
			studentName: string;
			questions: QuestionResult[];
			totalPoints: number;
		}[];
		maxPoints: number;
	}

	let { students, maxPoints }: Props = $props();

	const expanded = new SvelteSet<string>();
	function toggle(studentId: string) {
		if (expanded.has(studentId)) expanded.delete(studentId);
		else expanded.add(studentId);
	}
</script>

<div class="flex flex-col gap-3">
	{#each students as student (student.studentId)}
		{@const isOpen = expanded.has(student.studentId)}
		{@const accuracy = maxPoints > 0 ? (student.totalPoints / maxPoints) * 100 : 0}
		<div class="rounded-lg border">
			<button
				class="flex w-full flex-row items-center gap-3 px-4 py-3 text-left"
				onclick={() => toggle(student.studentId)}
			>
				<ChevronRightIcon
					class={[
						'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
						isOpen && 'rotate-90'
					]}
				/>
				<span class="font-medium">{student.studentName}</span>
				<span class="ml-auto text-sm tabular-nums text-muted-foreground">
					{student.totalPoints} / {maxPoints} Punkte
				</span>
				<Progress value={accuracy} class="h-2 w-32" />
			</button>

			{#if isOpen}
				<div class="flex flex-col gap-2 border-t px-4 py-3" transition:slide={{ duration: 150 }}>
					{#each student.questions as q, i (q.questionId)}
						<AnalyticsQuestionAnswerRow index={i} question={q} />
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
