<script lang="ts">
	import { resolve } from '$app/paths';
	import AnalyticsQuestionAnswerRow from '$lib/components/analytics/analytics-question-answer-row.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress';
	import { getStudentRooms } from '$lib/remote/analytics.remote';
	import { localePersistedState } from '$lib/state/locale.state.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const data = $derived(await getStudentRooms(params.id));

	const rooms = $derived(
		(data?.rooms ?? []).map((room) => ({
			...room,
			totalPoints: room.questions.reduce((sum, q) => sum + q.points, 0),
			accuracy:
				room.questions.length > 0
					? room.questions.reduce((sum, q) => sum + q.accuracy, 0) / room.questions.length
					: 0
		}))
	);

	const totalPoints = $derived(rooms.reduce((sum, r) => sum + r.totalPoints, 0));
	const avgAccuracy = $derived(
		rooms.length > 0 ? rooms.reduce((sum, r) => sum + r.accuracy, 0) / rooms.length : 0
	);

	const expanded = new SvelteSet<string>();
	function toggle(roomId: string) {
		if (expanded.has(roomId)) expanded.delete(roomId);
		else expanded.add(roomId);
	}
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" href={resolve('/teacher/analytics/students')}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{data?.studentName ?? 'Student'}
		</h1>
	</div>
</div>

{#if data}
	<div class="mx-5 mt-10 mb-10 flex w-full max-w-7xl flex-col gap-6">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Description>An Quizzen teilgenommen</Card.Description>
					<Card.Title class="text-3xl font-semibold">{rooms.length}</Card.Title>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Description>Durchschnittliche Genauigkeit</Card.Description>
					<Card.Title class="text-3xl font-semibold">{Math.round(avgAccuracy)}%</Card.Title>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Description>Punkte</Card.Description>
					<Card.Title class="text-3xl font-semibold">{totalPoints}</Card.Title>
				</Card.Header>
			</Card.Root>
		</div>

		<div class="flex flex-col gap-2">
			<h2 class="text-lg font-semibold">Quiz Historie</h2>

			<div class="flex flex-col gap-3">
				{#each rooms as room (room.roomId)}
					{@const isOpen = expanded.has(room.roomId)}
					{@const maxPoints = room.questions.reduce((sum, q) => sum + q.maxPoints, 0)}
					<div class="rounded-lg border">
						<button
							class="flex w-full flex-row items-center gap-3 px-4 py-3 text-left"
							onclick={() => toggle(room.roomId)}
						>
							<ChevronRightIcon
								class={[
									'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
									isOpen && 'rotate-90'
								]}
							/>

							<span class="font-medium">{room.quizTitle}</span>
							<span class="ml-auto shrink-0 text-sm text-muted-foreground">
								{new Date(room.createdAt).toLocaleString(localePersistedState.current, {
									dateStyle: 'full',
									timeStyle: 'short'
								})}
							</span>
							<span class="text-sm tabular-nums text-muted-foreground">
								{room.totalPoints} / {maxPoints} Punkte
							</span>
							<Progress value={room.accuracy} class="h-2 w-32" />
						</button>

						{#if isOpen}
							<div
								class="flex flex-col gap-2 border-t px-4 py-3"
								transition:slide={{ duration: 150 }}
							>
								{#each room.questions as q, i (q.questionId)}
									<AnalyticsQuestionAnswerRow index={i} question={q} />
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<p class="mx-5 mt-10 text-sm text-muted-foreground">Dieser Student wurde nicht gefunden.</p>
{/if}
