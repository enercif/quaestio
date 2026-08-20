<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { inviteUser, sendInviteEmail } from '$lib/remote/users.remote';
	import { roleLabels, type OrgRole } from '$lib/types/org-role.type';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';

	let open = $state(false);
	let email = $state('');
	let role = $state<OrgRole>('member');
	let submitting = $state(false);
	let inviteUrl = $state<string | undefined>(undefined);

	watch(
		() => open,
		(value) => {
			if (!value) return;
			email = '';
			role = 'member';
			inviteUrl = undefined;
		}
	);

	async function onSubmit() {
		submitting = true;
		const result = await inviteUser({ email, role });
		submitting = false;

		if (result.success) {
			inviteUrl = result.url;
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
		const result = await sendInviteEmail({ email, url: inviteUrl });
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
			<Dialog.Title>Benutzer einladen</Dialog.Title>
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
						<Label for="invite-email">E-Mail</Label>
						<Input id="invite-email" type="email" bind:value={email} required />
					</Field.Field>
					<Field.Field>
						<Label for="invite-role">Rolle</Label>
						<Select.Root type="single" bind:value={role}>
							<Select.Trigger id="invite-role" class="w-full">{roleLabels[role]}</Select.Trigger>
							<Select.Content>
								<Select.Item value="member">{roleLabels.member}</Select.Item>
								<Select.Item value="admin">{roleLabels.admin}</Select.Item>
								<Select.Item value="owner">{roleLabels.owner}</Select.Item>
							</Select.Content>
						</Select.Root>
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
