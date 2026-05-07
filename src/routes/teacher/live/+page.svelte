<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';

	import { resolve } from '$app/paths';
	import LaunchDialog from '$lib/components/quiz/launch-dialog.svelte';
	import type { Quiz } from '$lib/schemas/quiz.schema';
	import { roomsStore } from '$lib/stores/rooms.store.svelte';
	import CircleOffIcon from '@lucide/svelte/icons/circle-off';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const quizzes = $derived(data.quizzes);
	let selectedQuiz: Quiz = $state((() => quizzes)()[0]);
	let open = $state(false);
</script>

<div class="mx-5 mt-14 flex w-full max-w-7xl flex-col gap-10">
	<h1 class="text-2xl font-semibold">Live Räume</h1>

	{#if roomsStore.length === 0}
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
			{#each roomsStore as room (room.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title>Raum {room.id}</Card.Title>
						<Card.Description>{room.quiz.title}</Card.Description>
					</Card.Header>
					<Card.Footer class="flex flex-row items-center gap-2">
						<Button
							class="grow"
							variant="secondary"
							onclick={() => {
								roomsStore.splice(
									roomsStore.findIndex((r) => r.id === room.id),
									1
								);
							}}
						>
							Schließen
						</Button>
						<Button class="grow" href={resolve(`/teacher/live/${room.id}`)}>Beitreten</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<LaunchDialog quiz={selectedQuiz} hidden bind:open />
