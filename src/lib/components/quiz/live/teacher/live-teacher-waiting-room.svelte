<script lang="ts">
	import { env } from '$env/dynamic/public';
	import icon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { nextQuestion } from '$live/rooms';
	import Play from '@lucide/svelte/icons/play';
	import QR from '@svelte-put/qr/svg/QR.svelte';
	import { LiveTeacherState } from './live-teacher.state.svelte';

	const live = LiveTeacherState.get();
</script>

<div class="flex flex-col gap-10">
	<Card.Root>
		<Card.Content>
			<div class="flex h-64 flex-row items-center gap-10 px-20">
				<div class="flex grow flex-col items-center justify-center gap-4">
					<p class="text-xl font-semibold text-muted-foreground">Raum Code</p>

					<h1 class="text-6xl font-bold tracking-widest">{live.roomId}</h1>
				</div>

				<Separator orientation="vertical" />

				<div class="size-64">
					<QR
						data={`${env.PUBLIC_BASE_URL}/student/r/${live.roomId}`}
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
					{#if live.roomData?.limit}
						<p class="font-semibold">
							{live.studentPresence.length} von {live.roomData.limit} beigetreten
						</p>
					{:else}
						<p class="font-semibold">{live.studentPresence.length} beigetreten</p>
					{/if}
					<Button onclick={() => nextQuestion(live.roomId)}>
						<Play />
						Quiz starten
					</Button>
				</div>

				{#if live.roomData?.limit}
					<Progress value={live.studentPresence.length} max={live.roomData.limit} />
				{/if}

				<div class="flex flex-row flex-wrap gap-3">
					{#each live.studentPresence as presence (presence.key)}
						{@const student = presence.data}
						<div
							class="flex flex-row items-center gap-1 rounded-3xl border bg-secondary px-3 py-1 transition-opacity"
						>
							<div class="p-1 text-xs font-semibold">
								{student.name.slice(0, 2).toUpperCase()}
							</div>
							<span class="text-xs">{student.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
