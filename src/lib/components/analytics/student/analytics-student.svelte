<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { AnalyticsStudent } from '$lib/schemas/analytics.schema';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import AnalyticsStudentRoomRow from './analytics-student-room-row.svelte';
	import { analyticsStudentContext, AnalyticsStudentState } from './analytics-student.state.svelte';

	interface Props {
		analytics: AnalyticsStudent;
	}

	let { analytics }: Props = $props();

	const ctx = analyticsStudentContext.set(new AnalyticsStudentState(() => analytics));

	const achievedStudentPoints = $derived(
		ctx.rooms.reduce((sum, room) => {
			return (
				sum +
				room.questions.reduce((sum, question) => {
					return sum + question.achievedPoints;
				}, 0)
			);
		}, 0)
	);

	const maximumStudentPoints = $derived(
		ctx.rooms.reduce((sum, room) => {
			return (
				sum +
				room.questions.reduce((sum, question) => {
					return sum + question.maxPoints;
				}, 0)
			);
		}, 0)
	);

	const avgStudentAccuracy = $derived((achievedStudentPoints / maximumStudentPoints) * 100);
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" href={resolve('/teacher/analytics/students')}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{ctx.name}
		</h1>
	</div>
</div>

<div class="mx-5 mt-10 mb-10 flex w-full max-w-7xl flex-col gap-6">
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<Card.Root>
			<Card.Header>
				<Card.Description>An Quizzen teilgenommen</Card.Description>
				<Card.Title class="text-3xl font-semibold">{ctx.rooms.length}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Description>Durchschnittliche Genauigkeit</Card.Description>
				<Card.Title class="text-3xl font-semibold">{Math.round(avgStudentAccuracy)}%</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Description>Punkte</Card.Description>
				<Card.Title class="text-3xl font-semibold">{achievedStudentPoints}</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	<div class="flex flex-col gap-2">
		<h2 class="text-lg font-semibold">Quiz Historie</h2>

		<div class="flex flex-col gap-3">
			{#each ctx.rooms as room (room.code)}
				<AnalyticsStudentRoomRow {room} />
			{/each}
		</div>
	</div>
</div>
