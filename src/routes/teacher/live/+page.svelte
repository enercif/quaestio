<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { roomsStore } from '$lib/stores/rooms.store.svelte';
</script>

<p>Current Rooms:</p>
{#each roomsStore as room (room.id)}
	<div>
		<p>Room ID: {room.id}</p>
		<p>Limit: {room.limit ?? 'No limit'}</p>

		<Button
			onclick={() => {
				roomsStore.splice(
					roomsStore.findIndex((r) => r.id === room.id),
					1
				);
			}}
		>
			Close Room
		</Button>
	</div>
{/each}
