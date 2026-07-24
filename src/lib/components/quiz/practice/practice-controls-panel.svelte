<script lang="ts">
	import type { PracticeState } from '$lib/components/quiz/practice/practice.state.svelte';
	import { remainingMs } from '$lib/components/quiz/quiz.utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import FlagIcon from '@lucide/svelte/icons/flag';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import SkipForwardIcon from '@lucide/svelte/icons/skip-forward';
	import { slide } from 'svelte/transition';

	let { practice }: { practice: PracticeState } = $props();

	const revealed = $derived(practice.roomState === 'answer');
	const paused = $derived(practice.paused_remaining != null);
	const timeUp = $derived(remainingMs(practice.roomView) === 0);

	let showControls = $state(true);
</script>

<Card.Root class="fixed bottom-6 right-6 z-20 w-fit shadow-lg p-0">
	<Card.Content
		class="flex flex-row items-center gap-1 transition-all duration-150 {showControls
			? 'p-3'
			: 'p-1'}"
	>
		<Button variant="ghost" size="icon" onclick={() => (showControls = !showControls)}>
			<ChevronLeftIcon
				class={['transition-transform duration-150', showControls && 'rotate-180']}
			/>
		</Button>

		{#if showControls}
			<div class="flex flex-row items-center gap-2" transition:slide={{ duration: 150, axis: 'x' }}>
				{#if revealed}
					<Button onclick={practice.next}>
						{#if practice.isLast}
							<FlagIcon />
							Quiz beenden
						{:else}
							<ArrowRightIcon />
							Nächste Frage
						{/if}
					</Button>
				{:else if timeUp}
					<Button onclick={practice.showResults}>
						<EyeIcon />
						Ergebnisse anzeigen
					</Button>
				{:else}
					{#if paused}
						<Button variant="outline" onclick={practice.resume}>
							<PlayIcon />
							Fortsetzen
						</Button>
					{:else}
						<Button variant="outline" onclick={practice.pause}>
							<PauseIcon />
							Pause
						</Button>
					{/if}
					<Button onclick={practice.showResults}>
						<SkipForwardIcon />
						Zu den Ergebnissen springen
					</Button>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
