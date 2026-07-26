<script lang="ts">
	import type { PracticeState } from '$lib/components/quiz/practice/practice.state.svelte';
	import QuizControls from '$lib/components/quiz/quiz-controls.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import { slide } from 'svelte/transition';

	let { practice }: { practice: PracticeState } = $props();

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
				<QuizControls flow={practice} />
			</div>
		{/if}
	</Card.Content>
</Card.Root>
