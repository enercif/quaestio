<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import icon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { leaveRoomTeacher, selectRoomById } from '$lib/remote/room.remote';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import QR from '@svelte-put/qr/svg/QR.svelte';

	let { data } = $props();

	const room = $derived(await selectRoomById(data.id));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const students: any = [];

	async function onLeaveClick() {
		await leaveRoomTeacher(data.id);
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
			<h1 class="text-center leading-none font-semibold">{room?.quiz.title}</h1>
			<Separator orientation="vertical" />
			<h1 class="text-center leading-none font-semibold">{room?.id}</h1>
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

					<h1 class="text-6xl font-bold tracking-widest">{room?.id}</h1>
				</div>

				<Separator orientation="vertical" />

				<div class="size-64">
					<QR
						data={`${PUBLIC_BASE_URL}/r/${room?.id}`}
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

	{#each Object.entries(room.teachers) as [key, teacher] (key)}
		<p>{teacher}</p>
	{/each}

	<Card.Root>
		<Card.Content>
			<div class="flex h-full flex-col gap-4.5">
				<div class="flex flex-row items-center justify-between gap-10">
					{#if room?.limit}
						<p class="font-semibold">{students.length} von {room.limit} beigetreten</p>
					{:else}
						<p class="font-semibold">{students.length} beigetreten</p>
					{/if}
					<Button>
						<Play />
						Quiz starten
					</Button>
				</div>

				{#if room?.limit}
					<Progress value={students.length} max={room.limit} />
				{/if}

				<div class="flex flex-row flex-wrap gap-3">
					{#each students as student (student.id)}
						<div
							class="flex flex-row items-center gap-1 rounded-3xl border bg-secondary px-3 py-1 transition-opacity"
							class:opacity-40={!student.connected}
							title={student.connected ? student.name : `${student.name} (getrennt)`}
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
