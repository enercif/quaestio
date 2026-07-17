<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';

	let currentPassword = $state('');
	let newPassword = $state('');
	let error = $state('');

	async function changePassword(e: SubmitEvent) {
		e.preventDefault();

		const { error: err } = await authClient.changePassword({
			currentPassword,
			newPassword
		});

		if (err) {
			error = err.message ?? 'Ungültiges passwort';
			return;
		}

		toast.success('Passwort wurde geändert.');
		goto(resolve('/teacher/quizzes'));
	}
</script>

<div class="flex size-full flex-col items-center justify-center gap-4">
	<h1 class="mt-10 w-full max-w-lg text-2xl font-semibold">Passwort ändern</h1>

	<form onsubmit={changePassword} class="flex w-full max-w-lg flex-col gap-6">
		<div>
			<Label for="current-password" class="mb-2 text-sm font-medium">Aktuelles passwort</Label>
			<Input
				id="current-password"
				type="password"
				bind:value={currentPassword}
				required
				placeholder="Aktuelles password"
			></Input>
		</div>
		<div>
			<Label for="new-password" class="mb-2 text-sm font-medium">Neues passwort</Label>
			<Input
				id="new-password"
				type="password"
				bind:value={newPassword}
				required
				placeholder="Neues passwort"
			></Input>
			{#if error}<p class="text-sm text-red-500">
					{error}
				</p>{/if}
		</div>
		<Button class="size-lg w-full" type="submit">Absenden</Button>
	</form>
	<Button href="/teacher/quizzes" variant="link">Zurück</Button>
</div>
