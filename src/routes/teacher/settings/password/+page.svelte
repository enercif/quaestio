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

<form onsubmit={changePassword} class="mt-10 flex w-lg flex-col gap-6">
	<div>
		<Label for="current-password" class="mb-2 text-sm font-medium">Current password</Label>
		<Input
			id="current-password"
			type="password"
			bind:value={currentPassword}
			required
			placeholder="Current password"
		></Input>
	</div>
	<div>
		<Label for="new-password" class="mb-2 text-sm font-medium">New password</Label>
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
<Button href="/teacher/quizzes" variant="link">Exit</Button>
