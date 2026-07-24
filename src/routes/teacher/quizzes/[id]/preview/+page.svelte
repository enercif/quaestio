<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PracticeControlsPanel from '$lib/components/quiz/practice/practice-controls-panel.svelte';
	import { PracticeState } from '$lib/components/quiz/practice/practice.state.svelte';
	import QuestionView from '$lib/components/quiz/question-view.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const practice = new PracticeState(data.quiz.questions);

	let tabValue = $state('practice');
	const showResources = $derived(tabValue === 'practice');

	function onLeaveClick() {
		goto(resolve('/teacher/quizzes/[id]', { id: data.quiz.id }));
	}
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" onclick={onLeaveClick}>
			<ArrowLeftIcon />
			Zurück zum Editor
		</Button>

		<h1 class="text-center leading-none font-semibold">{data.quiz.title}</h1>

		<Tabs.Root bind:value={tabValue} class="ml-auto">
			<Tabs.List>
				<Tabs.Trigger value="live">Live</Tabs.Trigger>

				<Tabs.Trigger value="practice">Übungsraum</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>
	</div>
</div>

<div class="flex w-full flex-col items-center">
	{#if practice.roomState === 'finished'}
		<div class="flex grow flex-col items-center justify-center gap-3 py-20">
			<h1 class="text-2xl font-semibold">Quiz beendet</h1>
			<p class="text-muted-foreground">So erleben Studenten das Ende des Übungsraums.</p>
			<Button onclick={onLeaveClick}>Zurück zum Editor</Button>
		</div>
	{:else}
		<QuestionView
			room={practice.roomView}
			selected={practice.selected}
			onSubmit={practice.submit}
			{showResources}
		/>

		<PracticeControlsPanel {practice} />
	{/if}
</div>
