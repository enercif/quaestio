<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { LiveOpenTextQuestion } from '$lib/schemas/question.schema';
	import SendIcon from '@lucide/svelte/icons/send';
	import { watch } from 'runed';
	import { RunnerState } from './question-runner.state.svelte';

	const runner = RunnerState.get();
	const question = $derived(runner.currentQuestion as LiveOpenTextQuestion);

	let openText = $state('');

	watch(
		() => question.id,
		() => {
			openText = runner.selected[0] ?? '';
		}
	);
</script>

<form
	class="flex flex-col items-end gap-3 w-full mt-5"
	onsubmit={(event) => {
		event.preventDefault();
		if (openText.trim()) runner.submit([openText.trim()]);
	}}
>
	<Textarea
		placeholder="Deine Antwort…"
		bind:value={openText}
		disabled={runner.locked}
		class="h-50"
	/>
	<div class="flex flex-row justify-between items-start w-full">
		<span class="text-sm text-muted-foreground">{openText.length} Zeichen</span>

		{#if !runner.revealed}
			<Button type="submit" disabled={runner.locked || !openText.trim()}>
				<SendIcon />
				Senden
			</Button>
		{/if}
	</div>
</form>
{#if runner.selected[0]}
	<p class="mt-2 text-sm text-muted-foreground">Gesendet: {runner.selected[0]}</p>
{/if}
