<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { listAnswerRooms } from '$lib/remote/analytics.remote';
	import { localePersistedState } from '$lib/state/locale.state.svelte';
	import CircleOffIcon from '@lucide/svelte/icons/circle-off';

	const rooms = $derived(await listAnswerRooms());
</script>

<div class="rounded-lg border">
	<table class="size-full h-fit">
		<thead>
			<tr class="border-b text-sm text-secondary-foreground/75">
				<th class="w-2/5 py-2 pl-4 text-left font-semibold">Quiz</th>
				<th class="py-2 text-left font-semibold">Code</th>
				<th class="py-2 text-left font-semibold">Studenten</th>
				<th class="py-2 text-left font-semibold">Erstellt am</th>
			</tr>
		</thead>
		{#if rooms.length > 0}
			<tbody>
				{#each rooms as room (room.id)}
					<tr class="border-b transition-colors duration-200 hover:bg-secondary">
						<td class="py-2 pl-4">
							<a class="hover:underline" href={resolve(`/teacher/analytics/rooms/${room.id}`)}>
								{room.quizTitle}
							</a>
						</td>
						<td class="py-2 font-mono text-sm">{room.code}</td>
						<td class="py-2">{room.studentCount}</td>
						<td class="py-2">
							{new Date(room.createdAt).toLocaleString(localePersistedState.current, {
								dateStyle: 'medium',
								timeStyle: 'short'
							})}
						</td>
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>

	{#if rooms.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CircleOffIcon />
				</Empty.Media>
				<Empty.Title>Keine Räume</Empty.Title>
				<Empty.Description>
					Es liegen noch keine Antworten aus abgehaltenen Quizzen vor.
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
</div>
