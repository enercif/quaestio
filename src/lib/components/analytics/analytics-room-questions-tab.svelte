<script lang="ts">
	import AnalyticsQuestionStats from '$lib/components/analytics/analytics-question-stats.svelte';
	import type { Question } from '$lib/schemas/question.schema';

	interface Props {
		questionStats: { question: Question; selections: string[][] }[];
	}

	let { questionStats }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	{#each questionStats as stat, i (stat.question.id)}
		<AnalyticsQuestionStats index={i} question={stat.question} selections={stat.selections} />
	{/each}
</div>
