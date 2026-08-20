<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { page } from '$app/state';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let name = $state('');
	let email = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let savingName = $state(false);
	let savingEmail = $state(false);
	let savingPassword = $state(false);
	let passwordError = $state('');

	watch(
		() => open,
		(value) => {
			if (!value) return;
			name = page.data.user?.name ?? '';
			email = page.data.user?.email ?? '';
			currentPassword = '';
			newPassword = '';
			passwordError = '';
		}
	);

	async function onSaveName(e: SubmitEvent) {
		e.preventDefault();
		savingName = true;
		const { error } = await authClient.updateUser({ name });
		savingName = false;
		if (error) {
			toast.error(error.message ?? 'Name konnte nicht geändert werden.');
			return;
		}
		toast.success('Name wurde geändert.');
	}

	async function onSaveEmail(e: SubmitEvent) {
		e.preventDefault();
		savingEmail = true;
		const { error } = await authClient.changeEmail({ newEmail: email });
		savingEmail = false;
		if (error) {
			toast.error(error.message ?? 'E-Mail konnte nicht geändert werden.');
			return;
		}
		toast.success('Bestätigungslink wurde an die neue E-Mail-Adresse gesendet.');
	}

	async function onSavePassword(e: SubmitEvent) {
		e.preventDefault();
		passwordError = '';
		savingPassword = true;
		const { error } = await authClient.changePassword({ currentPassword, newPassword });
		savingPassword = false;
		if (error) {
			passwordError = error.message ?? 'Ungültiges Passwort';
			return;
		}
		currentPassword = '';
		newPassword = '';
		toast.success('Passwort wurde geändert.');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Konto</Dialog.Title>
		</Dialog.Header>

		<form onsubmit={onSaveName} class="flex flex-col gap-3">
			<Field.Field>
				<Label for="account-name">Name</Label>
				<div class="flex gap-2">
					<Input id="account-name" bind:value={name} required />
					<Button type="submit" variant="secondary" disabled={savingName}>Speichern</Button>
				</div>
			</Field.Field>
		</form>

		<form onsubmit={onSaveEmail} class="flex flex-col gap-3">
			<Field.Field>
				<Label for="account-email">E-Mail</Label>
				<div class="flex gap-2">
					<Input id="account-email" type="email" bind:value={email} required />
					<Button type="submit" variant="secondary" disabled={savingEmail}>Speichern</Button>
				</div>
			</Field.Field>
		</form>

		<form onsubmit={onSavePassword} class="flex flex-col gap-3">
			<Field.Field>
				<Label for="account-current-password">Aktuelles Passwort</Label>
				<Input id="account-current-password" type="password" bind:value={currentPassword} required />
			</Field.Field>
			<Field.Field>
				<Label for="account-new-password">Neues Passwort</Label>
				<Input id="account-new-password" type="password" bind:value={newPassword} required />
				{#if passwordError}<p class="text-sm text-red-500">{passwordError}</p>{/if}
			</Field.Field>
			<Button type="submit" disabled={savingPassword} class="self-start">Passwort ändern</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
