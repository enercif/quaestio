<script lang="ts">
	import AnalyticsRoom from '$lib/components/analytics/room/analytics-room.svelte';
	import { getRoomAnalytics } from '$lib/remote/analytics.remote';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const analytics = $derived(await getRoomAnalytics(params.id));
</script>

{#if analytics}
	<AnalyticsRoom {analytics} />
{:else}
	<p class="mx-5 mt-10 text-sm text-muted-foreground">Dieser Raum wurde nicht gefunden.</p>
{/if}
