<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		liveTeacherContext,
		LiveTeacherState
	} from '$lib/components/quiz/live/teacher/live-teacher.state.svelte';
	import LiveTeacherQuestion from '$lib/components/quiz/live/teacher/live-teacher-question.svelte';
	import LiveTeacherWaitingRoom from '$lib/components/quiz/live/teacher/live-teacher-waiting-room.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	import { deleteRoom } from '$live/rooms';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const live = liveTeacherContext.set(
		new LiveTeacherState(() => ({ roomId: data.id, userId: data.user.id }))
	);

	async function onLeaveClick() {
		closeLive(data.id);
		goto(resolve('/teacher/quizzes'));
	}

	async function onAnalysisClick() {
		closeLive(data.id);
		goto(resolve(`/teacher/analytics/rooms`));
	}

	async function closeLive(code: string) {
		const result = await deleteRoom(code);
		if (!result) {
			toast.error('Fehler beim Schließen des Raums');
		}
	}
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" onclick={onLeaveClick}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<div class="flex h-4 flex-row items-center gap-3">
			<h1 class="text-center leading-none font-semibold">{live.roomData?.quiz.title}</h1>
			<Separator orientation="vertical" />
			<h1 class="text-center leading-none font-semibold">{live.roomData?.code}</h1>
		</div>

		<div class="ml-auto flex flex-row items-center gap-2 font-semibold">
			<span class="relative flex size-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"
				></span>
				<span class="relative inline-flex size-2 rounded-full bg-destructive"></span>
			</span>
			Live
		</div>
	</div>
</div>

<div class="px-10 mt-6 w-full max-w-7xl">
	{#if !live.roomData}
		<div class="flex grow flex-col items-center justify-center gap-3 text-muted-foreground">
			<LoaderCircleIcon class="size-8 animate-spin" />
			<p class="font-medium">Raum wird geladen…</p>
		</div>
	{:else if live.roomData.state === 'waiting'}
		<LiveTeacherWaitingRoom />
	{:else if live.roomData.state === 'question' || live.roomData.state === 'answer'}
		<LiveTeacherQuestion />
	{:else if live.roomData.state === 'finished'}
		<div class="flex grow flex-col items-center justify-center gap-6 py-16">
			<div class="flex flex-col items-center gap-3 text-center">
				<h1 class="text-2xl font-semibold">Quiz beendet</h1>
				<p class="text-muted-foreground">
					Die Antworten wurden gespeichert und können in der Analyse ausgewertet werden.
				</p>
			</div>

			<div class="flex flex-row gap-2">
				<Button variant="outline" onclick={onLeaveClick}>Zurück zur Übersicht</Button>
				<Button onclick={onAnalysisClick}>Zur Analyse</Button>
			</div>
		</div>
	{/if}
</div>
