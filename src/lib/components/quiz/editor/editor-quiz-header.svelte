<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import LaunchDialog from '$lib/components/quiz/launch-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import SaveIcon from '@lucide/svelte/icons/save';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { EditorState } from './editor.state.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';

	const state = EditorState.get();
</script>

<div class="flex w-full items-center justify-center border-b py-2">
	<div class="flex w-full max-w-7xl items-center sm:justify-start sm:gap-4">
		<Button variant="ghost" href={resolve('/teacher/quizzes')}>
			<ArrowLeftIcon />
			Zurück
		</Button>

		<h1 class="text-center leading-none font-semibold">
			{state.quiz.title}
		</h1>

		<!-- Desktop -->
		<div class="hidden ml-auto flex-row items-center gap-3 md:flex">
			{#if state.quizId}
				<Button variant="destructive" onclick={() => state.remove()}>
					<TrashIcon />
					Löschen
				</Button>
			{/if}

			<Button
				variant="ghost"
				onclick={async () => {
					if (await state.upsert()) {
						goto(resolve('/teacher/quizzes/[id]/preview', { id: state.quizId! }));
					}
				}}
			>
				<EyeIcon />
				Übersicht
			</Button>

			<Button variant="secondary" onclick={() => state.save()} disabled={!state.hasChanges}>
				<SaveIcon />

				Speichern
			</Button>
			<LaunchDialog
				quiz={{ ...state.quiz, id: state.quizId! }}
				label="Starte Quiz"
				preOpenCallback={() => state.upsert()}
			/>
		</div>

		<!-- Mobile -->
		<div class="md:hidden ml-auto flex">
			<LaunchDialog
				quiz={{ ...state.quiz, id: state.quizId! }}
				label="Starte Quiz"
				preOpenCallback={() => state.upsert()}
			/>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="icon">
						<MoreVerticalIcon />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="">
					<DropdownMenu.Item
						onclick={async () => {
							if (await state.upsert()) {
								goto(resolve('/teacher/quizzes/[id]/preview', { id: state.quizId! }));
							}
						}}
					>
						<EyeIcon />
						Übersicht
					</DropdownMenu.Item>

					<DropdownMenu.Item disabled={!state.hasChanges} onclick={() => state.save()}>
						<SaveIcon />
						Speichern
					</DropdownMenu.Item>

					{#if state.quizId}
						<DropdownMenu.Item class="text-destructive" onclick={() => state.remove()}>
							<TrashIcon />
							Löschen
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</div>
