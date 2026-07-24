<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import HoneycombGrid from '$lib/components/ui/honeycomb-grid/honeycomb-grid.svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { LiveStudentState } from './live-student.state.svelte';

	const live = LiveStudentState.get();

	function onLeaveClick() {
		goto(resolve('/'));
	}
</script>

<div class="mx-5 mt-6 flex w-full max-w-lg flex-col gap-6 px-5">
	<Card.Root>
		<Card.Content>
			<div class="flex flex-col items-center gap-4 pt-4 pb-10 text-center">
				<HoneycombGrid presence={live.studentPresence} selfId={live.id} />
				<div class="my-2 rounded-xl bg-muted px-3 py-1 text-base text-muted-foreground">
					<p>{live.code}</p>
				</div>
				<h1 class="text-2xl font-bold">Du bist dabei, {live.name}!</h1>
				<p class="text-muted-foreground">Warte, bis deine Lehrkraft das Quiz startet.</p>
			</div>
			<div class="flex flex-col gap-4.5">
				{#if live.roomData?.limit}
					<p class="font-semibold">
						{live.studentPresence.length} von {live.roomData.limit} beigetreten
					</p>
					<Progress value={live.studentPresence.length} max={live.roomData.limit} />
				{:else}
					<p class="font-semibold">{live.studentPresence.length} beigetreten</p>
				{/if}
			</div>
		</Card.Content>
		<Card.Footer>
			<Button class="w-full" variant="secondary" onclick={onLeaveClick}>Verlassen</Button>
		</Card.Footer>
	</Card.Root>
</div>
