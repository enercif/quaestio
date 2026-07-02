<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';

	let value = $state('');

	function onclick() {
		goto(
			resolve('/r/[id]', {
				id: value
			})
		);
	}
</script>

<div class="flex size-full flex-col items-center justify-center gap-8">
	<Card.Root class="w-1/2 max-w-90">
		<Card.Header class="text-center">
			<div
				class="mx-auto mt-3 mb-5 flex w-fit flex-row items-center gap-1 rounded-xl bg-primary/10 px-3 py-1 text-base text-primary"
			>
				<GraduationCapIcon />
				<p>Quaestio</p>
			</div>
			<Card.Title class="text-2xl font-bold">Quiz beitreten</Card.Title>
			<Card.Description>Enter the room code your teacher shared</Card.Description>
		</Card.Header>
		<Card.Content class="mt-4">
			<Label for="code" class="mb-2 text-sm font-medium">Code</Label>
			<Input
				id="code"
				autofocus
				placeholder="XXXXXX"
				maxlength={6}
				bind:value
				class="h-15 text-center text-3xl! font-semibold tracking-[0.5rem] uppercase placeholder:text-center"
			/>
		</Card.Content>
		<Card.Footer>
			<Button class="w-full" size="lg" {onclick}>
				Continue
				<ArrowRightIcon />
			</Button>
		</Card.Footer>
	</Card.Root>

	<Button href="/teacher/quizzes" variant="link">Zur Lehrer Ansicht</Button>
</div>
