<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let currentPassword = $state('');
	let newPassword = $state('');
	let error = $state('');

	async function changePassword(e: SubmitEvent) {
		e.preventDefault();

		// const { data, error: err }
		const { error: err } = await authClient.changePassword({
			currentPassword,
			newPassword
		});

		if (err) {
			error = err.message ?? 'Invalid password';
			return;
		}

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
				placeholder="Current password"
			></Input>
		</div>
		<div>
			<Label for="new-password" class="mb-2 text-sm font-medium">Neues passwort</Label>
			<Input
				id="new-password"
				type="password"
				bind:value={newPassword}
				required
				placeholder="New password"
			></Input>
			{#if error}<p class="text-sm text-red-500">
					{error}
				</p>{/if}
		</div>
		<Button class="size-lg w-full" type="submit">Submit</Button>
	</form>
</div>
<Button href="/teacher/quizzes" variant="link">Exit</Button>
