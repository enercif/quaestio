<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { inviteUser, sendInviteEmail } from '$lib/remote/users.remote';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';

	let open = $state(false);
	let name = $state('');
	let email = $state('');
	let submitting = $state(false);
	let inviteUrl = $state<string | undefined>(undefined);

	watch(
		() => open,
		(value) => {
			if (!value) return;
			name = '';
			email = '';
			inviteUrl = undefined;
		}
	);

	async function onSubmit() {
		submitting = true;
		const result = await inviteUser({ name, email });
		submitting = false;

		if (result.success) {
			inviteUrl = result.url;
			await invalidateAll();
		} else {
			toast.error(result.error);
		}
	}

	async function onCopy() {
		if (!inviteUrl) return;
		await navigator.clipboard.writeText(inviteUrl);
		toast.success('Link kopiert');
	}

	async function onSendEmail() {
		if (!inviteUrl) return;
		const result = await sendInviteEmail({ name, email, url: inviteUrl });
		if (result.success) {
			toast.success('Einladung wurde per E-Mail versendet');
		} else {
			toast.error(result.error);
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>
				<PlusIcon />
				Neuer Benutzer
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Lehrer einladen</Dialog.Title>
		</Dialog.Header>

		{#if !inviteUrl}
			<form
				id="invite-user-form"
				onsubmit={(event) => {
					event.preventDefault();
					onSubmit();
				}}
			>
				<div class="grid gap-4">
					<Field.Field>
						<Label for="invite-name">Name</Label>
						<Input id="invite-name" bind:value={name} required />
					</Field.Field>
					<Field.Field>
						<Label for="invite-email">E-Mail</Label>
						<Input id="invite-email" type="email" bind:value={email} required />
					</Field.Field>
				</div>
			</form>
			<Dialog.Footer>
				<Dialog.Close type="button" class={buttonVariants({ variant: 'secondary' })}>
					Abbrechen
				</Dialog.Close>
				<Button type="submit" form="invite-user-form" disabled={submitting}>Einladen</Button>
			</Dialog.Footer>
		{:else}
			<div class="grid gap-2">
				<Label for="invite-url">Einladungslink</Label>
				<Input id="invite-url" readonly value={inviteUrl} />
			</div>
			<Dialog.Footer>
				<Button variant="secondary" onclick={onCopy}>Kopieren</Button>
				<Button onclick={onSendEmail}>Per E-Mail senden</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
