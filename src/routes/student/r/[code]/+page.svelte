<script lang="ts">
	import { resolve } from '$app/paths';
	import LiveStudentQuestion from '$lib/components/quiz/live/student/live-student-question.svelte';
	import LiveStudentWaitingRoom from '$lib/components/quiz/live/student/live-student-waiting-room.svelte';
	import {
		liveStudentContext,
		LiveStudentState
	} from '$lib/components/quiz/live/student/live-student.state.svelte';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import * as Card from '$lib/components/ui/card/index.js';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const live = liveStudentContext.set(new LiveStudentState(() => data));
</script>

<div class="flex h-full flex-col items-center justify-center w-full">
	{#if !live.roomData}
		<div class="flex grow flex-col items-center justify-center gap-3 text-muted-foreground">
			<LoaderCircleIcon class="size-8 animate-spin" />
			<p class="font-medium">Raum wird geladen…</p>
		</div>
	{:else if live.roomData.state === 'waiting'}
		<LiveStudentWaitingRoom />
	{:else if live.roomData.state === 'question' || live.roomData.state === 'answer'}
		<LiveStudentQuestion />
	{:else if live.roomData.state === 'finished'}
		<div class="w-full max-w-90">
			<Card.Root>
				<Card.Header class="text-center">
					<div
						class="mx-auto mt-3 mb-5 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
					>
						<CheckCircle2Icon class="size-6" />
					</div>
					<Card.Title class="text-2xl font-bold">Quiz beendet</Card.Title>
					<Card.Description>
						Deine Antworten wurden gespeichert. Danke fürs Mitmachen!
					</Card.Description>
				</Card.Header>
				<Card.Footer>
					<Button class="w-full" size="lg" href={resolve('/')}>Zurück zur Startseite</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	{/if}
</div>
