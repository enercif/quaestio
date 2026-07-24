<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import type { Quiz } from '$lib/schemas/quiz.schema';
	import type { RoomInsert } from '$lib/schemas/room.schema';
	import { insertRoom } from '$live/rooms';
	import PlayIcon from '@lucide/svelte/icons/play';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';

	interface Props {
		quiz: Quiz;
		label?: string;
		preOpenCallback?: () => Promise<boolean>;
		hidden?: boolean;
		open?: boolean;
	}

	let { quiz, label, preOpenCallback, hidden, open = $bindable(false) }: Props = $props();

	let roomId = $state('');
	let placeholder = $state('');
	let isLimited = $state(false);
	let limit = $state('');

	let invalid = $state(false);

	async function onClickStart() {
		if (isLimited && (parseInt(limit) <= 0 || isNaN(parseInt(limit)))) {
			invalid = true;
			return;
		}

		const roomInsert: RoomInsert = {
			code: roomId,
			limit: isLimited ? parseInt(limit) : undefined,
			quiz: quiz.id,
			state: 'waiting'
		};

		const result = await insertRoom(roomInsert);

		if (result) {
			open = false;
			goto(resolve('/teacher/live/[id]', { id: roomId }));
		} else {
			toast.error('Fehler beim Erstellen des Raums. Bitte versuche es erneut.');
		}
	}
	async function onClickOpen() {
		if (preOpenCallback) {
			open = await preOpenCallback();
		} else {
			open = true;
		}
	}

	watch(
		() => open,
		(value) => {
			if (value) {
				roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
				placeholder = Math.round(Math.random() * 100).toString();
			}

			isLimited = false;
		}
	);
</script>

<Dialog.Root bind:open>
	{#if !hidden}
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} onclick={onClickOpen}>
					<PlayIcon />
					{label}
				</Button>
			{/snippet}
		</Dialog.Trigger>
	{/if}

	<form>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{quiz.title} starten</Dialog.Title>
			</Dialog.Header>
			<div class="grid gap-8">
				<div class="flex flex-col items-center gap-1">
					<h1 class="text-xl">Raum ID</h1>
					<p class="text-2xl font-semibold">{roomId}</p>
				</div>
				<div class="flex flex-col gap-2">
					<div class="flex items-center gap-2">
						<Switch id="limit" bind:checked={isLimited} />
						<Label for="limit">Limitiere Raumgröße</Label>
					</div>
					{#if isLimited}
						<div transition:slide={{ duration: 200 }}>
							<Field.Field aria-invalid={invalid}>
								<Input
									aria-invalid={invalid}
									id="limit-size"
									name="limit-size"
									{placeholder}
									bind:value={limit}
									type="number"
									min="1"
								/>
								{#if invalid}
									<Field.Error
										>Wenn die Raumgröße limitiert ist, muss eine maximale Anzahl von Teilnehmern
										angegeben werden.</Field.Error
									>
								{/if}
							</Field.Field>
						</div>
					{/if}
				</div>
			</div>

			<Dialog.Footer>
				<Dialog.Close type="button" class={buttonVariants({ variant: 'secondary' })}
					>Abbrechen</Dialog.Close
				>
				<Button type="submit" onclick={onClickStart}>Starten</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</form>
</Dialog.Root>
