<script lang="ts">
	import AnalyticsStudent from '$lib/components/analytics/student/analytics-student.svelte';
	import { getStudentAnalytics } from '$lib/remote/analytics.remote';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const analytics = $derived(await getStudentAnalytics(params.id));
</script>

{#if analytics}
	<AnalyticsStudent {analytics} />
{:else}
	<p class="mx-5 mt-10 text-sm text-muted-foreground">Dieser Student wurde nicht gefunden.</p>
{/if}
