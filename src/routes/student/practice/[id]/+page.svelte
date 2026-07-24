<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PracticeControlsPanel from '$lib/components/quiz/practice/practice-controls-panel.svelte';
	import { PracticeState } from '$lib/components/quiz/practice/practice.state.svelte';
	import QuestionView from '$lib/components/quiz/question-view.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const practice = new PracticeState(data.quiz.questions);

	function onLeaveClick() {
		goto(resolve('/student'));
	}
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" onclick={onLeaveClick}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<h1 class="text-center leading-none font-semibold">{data.quiz.title}</h1>
		<p class="ml-auto text-sm text-muted-foreground">Übungsraum</p>
	</div>
</div>

<div class="flex w-full flex-col items-center">
	{#if practice.roomState === 'finished'}
		<div class="flex grow flex-col items-center justify-center gap-3 py-20">
			<h1 class="text-2xl font-semibold">Geschafft!</h1>
			<p class="text-muted-foreground">Du kannst diesen Übungsraum jederzeit erneut starten.</p>
			<Button onclick={onLeaveClick}>Zurück zu den Übungsräumen</Button>
		</div>
	{:else}
		<QuestionView
			room={practice.roomView}
			selected={practice.selected}
			onSubmit={practice.submit}
			showResources
		/>
		<PracticeControlsPanel {practice} />
	{/if}
</div>
