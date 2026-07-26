<script lang="ts">
	import AnalyticsRoomQuestionRow from './analytics-room-question-row.svelte';
	import { analyticsRoomContext } from './analytics-room.state.svelte';

	const ctx = analyticsRoomContext.get();
</script>

<div class="flex flex-col gap-4">
	{#each ctx.questions as question (question.id)}
		<AnalyticsRoomQuestionRow {question} quiz={ctx.quiz} />
	{/each}
</div>
