<script lang="ts">
	import AnalyticsRoomStudentRow from './analytics-room-student-row.svelte';
	import { analyticsRoomContext } from './analytics-room.state.svelte';

	const ctx = analyticsRoomContext.get();
</script>

<div class="flex flex-col gap-3">
	{#each ctx.students as student (student.id)}
		<AnalyticsRoomStudentRow {student} />
	{/each}
</div>
