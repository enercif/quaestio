<script lang="ts">
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { localePersistedState } from '$lib/state/locale.state.svelte';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { slide } from 'svelte/transition';
	import AnalyticsStudentQuestionRow from '../analytics-student-question-row.svelte';
	import { type AnalyticsStudentState } from './analytics-student.state.svelte';

	interface Props {
		room: (typeof AnalyticsStudentState.prototype.rooms)[number];
	}

	let { room }: Props = $props();

	let isOpen = $state(false);
	const achievedRoomPoints = $derived(
		room.questions.reduce((sum, question) => {
			return sum + question.achievedPoints;
		}, 0)
	);

	const maxRoomPoints = $derived(
		room.questions.reduce((sum, question) => {
			return sum + question.maxPoints;
		}, 0)
	);

	const roomAccuracy = $derived(maxRoomPoints > 0 ? (achievedRoomPoints / maxRoomPoints) * 100 : 0);
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

		<span class="font-medium">{room.quiz.title}</span>
		<span class="ml-auto shrink-0 text-sm text-muted-foreground">
			{new Date(room.created_at).toLocaleString(localePersistedState.current, {
				dateStyle: 'full',
				timeStyle: 'short'
			})}
		</span>
		<span class="text-sm tabular-nums text-muted-foreground">
			{achievedRoomPoints} / {maxRoomPoints} Punkte
		</span>
		<Progress value={roomAccuracy} class="h-2 w-32" />
	</button>

	{#if isOpen}
		<div class="flex flex-col gap-2 border-t px-4 py-3" transition:slide={{ duration: 150 }}>
			{#each room.questions as question (question.id)}
				{@const currentQuestion = room.quiz.questions.find((q) => q.id === question.id)!}
				<AnalyticsStudentQuestionRow {question} {currentQuestion} />
			{/each}
		</div>
	{/if}
</div>
