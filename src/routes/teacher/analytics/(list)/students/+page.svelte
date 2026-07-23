<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { listAnswerStudents } from '$lib/remote/analytics.remote';
	import CircleOffIcon from '@lucide/svelte/icons/circle-off';

	const students = $derived(await listAnswerStudents());
</script>

<div class="rounded-lg border">
	<table class="size-full">
		<thead>
			<tr class="border-b text-sm text-secondary-foreground/75">
				<th class="w-2/5 py-2 pl-4 text-left font-semibold">Name</th>
				<th class="py-2 text-left font-semibold">Teilgenommene Quizze</th>
			</tr>
		</thead>
		{#if students.length > 0}
			<tbody>
				{#each students as student (student.id)}
					<tr class="border-b transition-colors duration-200 hover:bg-secondary">
						<td class="py-2 pl-4">
							<a
								class="hover:underline"
								href={resolve(`/teacher/analytics/students/${student.id}`)}
							>
								{student.name}
							</a>
						</td>
						<td class="py-2">{student.roomCount}</td>
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>

	{#if students.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CircleOffIcon />
				</Empty.Media>
				<Empty.Title>Keine Studenten</Empty.Title>
				<Empty.Description>
					Es liegen noch keine Antworten aus abgehaltenen Quizzen vor.
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
</div>
