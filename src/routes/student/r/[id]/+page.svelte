<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Room } from '$lib/schemas/room.schema.js';
	import type { Presence } from '$lib/types/presence.type.js';
	import { room } from '$live/rooms';
	import { watch } from 'runed';
	import type { StreamStore } from 'svelte-realtime/client';

	let { data } = $props();

	const _roomData: StreamStore<Room | undefined> = $derived(room.data(data.id));
	const _roomPresence: StreamStore<Presence[]> = $derived(room.presence!(data.id));

	const roomData = $derived($_roomData);
	const roomPresence = $derived(($_roomPresence ?? []).filter((p) => p.data.type === 'student'));

	watch(
		() => roomData,
		(newRoomData) => {
			if (!newRoomData) return;

			if (newRoomData.state === 'ended') {
				alert('Das Quiz wurde beendet. Du wirst nun zurück zur Übersicht geleitet.');
				goto(resolve('/'));
			}
		}
	);
</script>

{#each roomPresence as presence (presence.key)}
	<p>{presence.data.name}</p>
{/each}

{JSON.stringify(roomData)}
