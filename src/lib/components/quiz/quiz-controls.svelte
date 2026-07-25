<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { QuizFlow } from '$lib/types/quiz-flow.type';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import FlagIcon from '@lucide/svelte/icons/flag';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import SkipForwardIcon from '@lucide/svelte/icons/skip-forward';

	let { flow }: { flow: QuizFlow } = $props();
</script>

{#if flow.revealed}
	<Button onclick={flow.next}>
		{#if flow.isLast}
			<FlagIcon />
			Quiz beenden
		{:else}
			<ArrowRightIcon />
			Nächste Frage
		{/if}
	</Button>
{:else if flow.timeUp}
	<Button onclick={flow.showResults}>
		<EyeIcon />
		Ergebnisse anzeigen
	</Button>
{:else}
	{#if flow.paused}
		<Button variant="outline" onclick={flow.resume}>
			<PlayIcon />
			Fortsetzen
		</Button>
	{:else}
		<Button variant="outline" onclick={flow.pause}>
			<PauseIcon />
			Pause
		</Button>
	{/if}
	<Button onclick={flow.showResults}>
		<SkipForwardIcon />
		Zu den Ergebnissen springen
	</Button>
{/if}
