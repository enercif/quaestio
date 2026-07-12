<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import LiveStudentQuestion from '$lib/components/quiz/live/student/live-student-question.svelte';
	import LiveStudentWaitingRoom from '$lib/components/quiz/live/student/live-student-waiting-room.svelte';
	import { LiveStudentState } from '$lib/components/quiz/live/student/live-student.state.svelte';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { watch } from 'runed';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const live = LiveStudentState.init(data);

	watch(
		() => live.roomData,
		(roomData) => {
			if (!roomData) return;

			switch (roomData.state) {
				case 'finished':
					alert('Das Quiz wurde beendet. Du wirst nun zurück zur Übersicht geleitet.');
					goto(resolve('/'));
					break;
			}
		}
	);
</script>

<div class="flex h-full flex-col items-center justify-center w-full">
	{#if !live.roomData}
		<div class="flex grow flex-col items-center justify-center gap-3 text-muted-foreground">
			<LoaderCircleIcon class="size-8 animate-spin" />
			<p class="font-medium">Raum wird geladen…</p>
		</div>
	{:else if live.roomData.state === 'waiting'}
		<LiveStudentWaitingRoom />
	{:else if live.roomData.state === 'question'}
		<LiveStudentQuestion />
	{/if}
</div>
