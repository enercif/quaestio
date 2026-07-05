<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import icon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { Room } from '$lib/schemas/room.schema.js';
	import type { Presence } from '$lib/types/presence.type.js';
	import { room, startRoom } from '$live/rooms';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import QR from '@svelte-put/qr/svg/QR.svelte';

	let { data } = $props();

	const _roomData = $derived(room.data(data.id));
	const _roomPresence = $derived(room.presence!(data.id));

	const roomData: Room | undefined = $derived($_roomData ? $_roomData : undefined);
	const roomPresence: Presence[] = $derived($_roomPresence ?? []);
	const studentPresence: Presence[] = $derived(
		roomPresence.filter((p) => p.data.type === 'student') ?? []
	);

	async function onLeaveClick() {
		goto(resolve('/teacher/live'));
	}
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-4">
		<Button variant="ghost" onclick={onLeaveClick}>
			<ArrowLeftIcon />
			Back
		</Button>

		<div class="flex h-4 flex-row items-center gap-3">
			<h1 class="text-center leading-none font-semibold">{roomData?.quiz.title}</h1>
			<Separator orientation="vertical" />
			<h1 class="text-center leading-none font-semibold">{roomData?.id}</h1>
		</div>

		<div class="ml-auto flex flex-row items-center gap-2 font-semibold">
			<span class="relative flex size-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"
				></span>
				<span class="relative inline-flex size-2 rounded-full bg-destructive"></span>
			</span>
			Live
		</div>
	</div>
</div>

<div class="mx-5 mt-6 flex w-full max-w-7xl flex-col gap-10">
	<Card.Root>
		<Card.Content>
			<div class="flex h-64 flex-row items-center gap-10 px-20">
				<div class="flex grow flex-col items-center justify-center gap-4">
					<p class="text-xl font-semibold text-muted-foreground">Raum Code</p>

					<h1 class="text-6xl font-bold tracking-widest">{roomData?.id}</h1>
				</div>

				<Separator orientation="vertical" />

				<div class="size-64">
					<QR
						data={`${PUBLIC_BASE_URL}/student/r/${roomData?.id}`}
						logo={icon}
						logoRatio={107 / 128}
						shape="circle"
						margin={4}
					>
						{#snippet svg({ attributes, innerHTML })}
							<svg {...attributes} class=" **:fill-blue-500">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html innerHTML}
							</svg>
						{/snippet}
					</QR>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content>
			<div class="flex h-full flex-col gap-4.5">
				<div class="flex flex-row items-center justify-between gap-10">
					{#if roomData?.limit}
						<p class="font-semibold">{studentPresence.length} von {roomData.limit} beigetreten</p>
					{:else}
						<p class="font-semibold">{studentPresence.length} beigetreten</p>
					{/if}
					<Button onclick={() => startRoom(data.id)}>
						<Play />
						Quiz starten
					</Button>
				</div>

				{#if roomData?.limit}
					<Progress value={studentPresence.length} max={roomData.limit} />
				{/if}

				<div class="flex flex-row flex-wrap gap-3">
					{#each studentPresence as presence (presence.key)}
						{@const student = presence.data}
						<div
							class="flex flex-row items-center gap-1 rounded-3xl border bg-secondary px-3 py-1 transition-opacity"
						>
							<div class="p-1 text-xs font-semibold">{student.name.slice(0, 2).toUpperCase()}</div>
							<span class="text-xs">{student.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
