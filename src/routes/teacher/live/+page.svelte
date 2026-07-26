<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import LaunchDialog from '$lib/components/quiz/launch-dialog.svelte';
	import type { Quiz } from '$lib/schemas/quiz.schema';
	import type { Room } from '$lib/schemas/room.schema';
	import { deleteRoom, rooms } from '$live/rooms';
	import CircleOffIcon from '@lucide/svelte/icons/circle-off';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const quizzes = $derived(data.quizzes);
	// svelte-ignore state_referenced_locally
	let selectedQuiz: Quiz = $state(quizzes[0]);
	let open = $state(false);

	const _rooms: Room[] = $derived($rooms);

	async function onCloseClick(code: string) {
		const result = await deleteRoom(code);
		if (!result) {
			toast.error('Fehler beim Schließen des Raums');
		}
	}

	function onJoinClick(code: string) {
		goto(resolve(`/teacher/live/${code}`));
	}
</script>

<div class="mx-5 mt-14 flex w-full max-w-7xl flex-col gap-10">
	<h1 class="text-2xl font-semibold">Live Räume</h1>

	{#if _rooms !== undefined && _rooms.length === 0}
		<div class="flex flex-row items-center justify-center">
			<Card.Root>
				<Card.Content>
					<Empty.Root>
						<Empty.Header>
							<Empty.Media variant="icon">
								<CircleOffIcon />
							</Empty.Media>
							<Empty.Title>Noch keine Räume</Empty.Title>
							<Empty.Description>
								Es sind aktuell keine Räume aktiv. Starte ein Quiz, um einen Raum zu erstellen.
							</Empty.Description>
						</Empty.Header>
						<Empty.Content>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button variant="default" {...props}>Starte ein Quiz</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<DropdownMenu.Group>
										{#each quizzes as quiz (quiz.id)}
											<DropdownMenu.Item
												onclick={() => {
													selectedQuiz = quiz;
													open = true;
												}}
											>
												{quiz.title}
											</DropdownMenu.Item>
										{/each}
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Empty.Content>
					</Empty.Root>
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-4">
			{#each _rooms as room (room.code)}
				<Card.Root>
					<Card.Header>
						<Card.Title>Raum {room.code}</Card.Title>
						<Card.Description>{room.quiz.title} | {room.state}</Card.Description>
					</Card.Header>
					<Card.Footer class="flex flex-row items-center gap-2">
						{#if room.teacher_id === data.user.id}
							<Button class="grow" variant="secondary" onclick={() => onCloseClick(room.code)}>
								Schließen
							</Button>
						{/if}
						<Button class="grow" onclick={() => onJoinClick(room.code)}>Beitreten</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<LaunchDialog quiz={selectedQuiz} hidden bind:open />
