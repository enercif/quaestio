<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { roomCodeForm, roomNameForm } from '$lib/remote/join.remote';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenCheckIcon from '@lucide/svelte/icons/book-open-check';
	import Check from '@lucide/svelte/icons/check';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import X from '@lucide/svelte/icons/x';
	import { onMount, untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let page: 1 | 2 = $state(untrack(() => (data.result ? 2 : 1)));
	let codeResult = $derived(roomCodeForm.result ?? data.result);
	let roomIdUpperCase = $derived(
		String(roomCodeForm.fields.roomId.value() ?? data.roomId ?? '').toUpperCase()
	);

	onMount(() => {
		roomCodeForm.fields.roomId.set(data.roomId ?? '');
	});
</script>

<div class="flex size-full flex-col items-center justify-center gap-8">
	{#if page === 1}
		<div class="w-1/2 max-w-90" in:fly>
			<Card.Root>
				<Card.Header class="text-center">
					<div
						class="mx-auto mt-3 mb-5 flex w-fit flex-row items-center gap-1 rounded-xl bg-primary/10 px-3 py-1 text-base text-primary"
					>
						<GraduationCapIcon />
						<p>Quaestio</p>
					</div>
					<Card.Title class="text-2xl font-bold">Quiz beitreten</Card.Title>
					<Card.Description>Gib den Raumcode ein, den dein Lehrer geteilt hat</Card.Description>
				</Card.Header>
				<Card.Content class="mt-4">
					<form
						{...roomCodeForm.enhance(async (result) => {
							if ((await result.submit()) && roomCodeForm.result) {
								page++;
							}
						})}
						id="room-code-form"
					>
						<Label for="code" class="mb-2 text-sm font-medium">Code</Label>
						<Input
							id="code"
							autofocus
							placeholder="XXXXXX"
							maxlength={6}
							{...roomCodeForm.fields.roomId.as('text')}
							class="h-15 text-center text-3xl! font-semibold tracking-[0.5rem] uppercase placeholder:text-center"
						/>
						{#each roomCodeForm.fields.roomId.issues() as issue (issue.message)}
							<p class="mt-3 text-sm text-destructive">{issue.message}</p>
						{/each}
					</form>
				</Card.Content>
				<Card.Footer class="flex flex-col gap-4">
					<Button class="w-full" size="lg" type="submit" form="room-code-form">
						Weiter
						<ArrowRightIcon />
					</Button>

					<div class="flex w-full flex-row items-center gap-4">
						<Separator class="flex-1" />
						<p>ODER</p>
						<Separator class="flex-1" />
					</div>

					<Button class="w-full" size="lg" variant="secondary" href={resolve('/student')}>
						Üben
						<BookOpenCheckIcon />
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>

		<Button href="/login" variant="link">Anmelden</Button>
	{:else}
		<div class="w-1/2 max-w-90" in:fly>
			{#if codeResult?.success}
				<Card.Root>
					<Card.Header class="text-center">
						<div class="flex flex-col items-start">
							<Button variant="link" onclick={() => page--}>
								<ArrowLeft />
								Zurück
							</Button>
							<div
								class="mx-auto mt-3 mb-5 flex w-fit flex-row items-center gap-1 rounded-xl bg-muted px-3 py-1 text-base text-muted-foreground"
							>
								<Check class="size-4 text-green-400" />
								<p>{roomIdUpperCase}</p>
							</div>
						</div>

						<Card.Title class="text-2xl font-bold">Wie heißt du?</Card.Title>
						<Card.Description>Der Lehrer kann dir so Punkte zuordnen</Card.Description>
					</Card.Header>
					<Card.Content class="mt-4">
						<form {...roomNameForm} id="room-name-form">
							<Label for="name" class="mb-2 text-sm font-medium">Dein Name</Label>
							<Input
								id="name"
								autofocus
								placeholder="Tony Stark"
								{...roomNameForm.fields.name.as(
									'text',
									codeResult?.success ? (codeResult.name ?? '') : ''
								)}
							/>

							{#each roomNameForm.fields.name.issues() as issue (issue.message)}
								<p class="mt-3 text-sm text-destructive">{issue.message}</p>
							{/each}

							<input {...roomNameForm.fields.roomId.as('hidden', roomIdUpperCase)} />
						</form>
					</Card.Content>
					<Card.Footer class="flex flex-col gap-4">
						<Button class="w-full" size="lg" type="submit" form="room-name-form">
							Quiz beitreten
							<ArrowRightIcon />
						</Button>
					</Card.Footer>
				</Card.Root>
			{:else}
				{@const isFull = codeResult && !codeResult.success && codeResult.reason === 'full'}
				<Card.Root>
					<Card.Header class="text-center">
						<div
							class="mx-auto mt-3 mb-5 flex w-fit flex-row items-center gap-1 rounded-xl bg-muted px-3 py-1 text-base text-muted-foreground"
						>
							<X class="size-4 text-destructive" />
							<p>{roomIdUpperCase}</p>
						</div>

						<Card.Title class="text-2xl font-bold">
							{isFull ? 'Der Raum ist voll' : 'Raum nicht gefunden'}
						</Card.Title>
						{#if isFull}
							<Card.Description
								>Die maximale Teilnehmerzahl wurde bereits erreicht.</Card.Description
							>
						{/if}
					</Card.Header>

					<Card.Footer class="flex flex-col gap-4">
						<Button class="w-full" size="lg" onclick={() => page--} autofocus>
							Zurück
							<ArrowLeft />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/if}
		</div>
	{/if}
</div>
