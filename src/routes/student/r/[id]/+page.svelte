<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import HoneycombGrid from '$lib/components/ui/honeycomb-grid/honeycomb-grid.svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import type { Room } from '$lib/schemas/room.schema.js';
	import type { Presence } from '$lib/types/presence.type.js';
	import { room } from '$live/rooms';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { watch } from 'runed';
	import type { StreamStore } from 'svelte-realtime/client';

	let { data } = $props();

	const _roomData: StreamStore<Room | undefined> = $derived(room.data(data.roomId));
	const _roomPresence: StreamStore<Presence[]> = $derived(room.presence!(data.roomId));

	const roomData = $derived($_roomData);
	const studentPresence = $derived(($_roomPresence ?? []).filter((p) => p.data.type === 'student'));

	watch(
		() => roomData,
		(newRoomData) => {
			if (!newRoomData) return;

			switch (newRoomData.state) {
				case 'ended':
					alert('Das Quiz wurde beendet. Du wirst nun zurück zur Übersicht geleitet.');
					goto(resolve('/'));
					break;
				case 'started':
					alert('Das Quiz wurde gestartet. Du wirst nun weitergeleitet.');
					break;
			}
		}
	);

	function onLeaveClick() {
		goto(resolve('/'));
	}
</script>

<div class="flex h-full flex-col items-center justify-center">
	{#if !roomData}
		<div class="flex grow flex-col items-center justify-center gap-3 text-muted-foreground">
			<LoaderCircleIcon class="size-8 animate-spin" />
			<p class="font-medium">Raum wird geladen…</p>
		</div>
	{:else if roomData.state !== 'ended'}
		<div class="mx-5 mt-6 flex w-full max-w-3xl flex-col gap-6 px-5">
			<Card.Root>
				<Card.Content>
					<div class="flex flex-col items-center gap-4 pt-4 pb-10 text-center">
						<HoneycombGrid presence={studentPresence} selfId={data.id} />
						<div class="my-2 rounded-xl bg-muted px-3 py-1 text-base text-muted-foreground">
							<p>{data.roomId}</p>
						</div>
						<h1 class="text-2xl font-bold">Du bist dabei, {data.name}!</h1>
						<p class="text-muted-foreground">Warte, bis deine Lehrkraft das Quiz startet.</p>
					</div>
					<div class="flex flex-col gap-4.5">
						{#if roomData.limit}
							<p class="font-semibold">
								{studentPresence.length} von {roomData.limit} beigetreten
							</p>
							<Progress value={studentPresence.length} max={roomData.limit} />
						{:else}
							<p class="font-semibold">{studentPresence.length} beigetreten</p>
						{/if}
					</div>
				</Card.Content>
				<Card.Footer>
					<Button class="w-full" variant="secondary" onclick={onLeaveClick}>Verlassen</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	{/if}
</div>
