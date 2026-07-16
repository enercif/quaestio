<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import InviteUserDialog from '$lib/components/admin/invite-user-dialog.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { cancelInvite, deleteUser } from '$lib/remote/users.remote';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const users = $derived(data.users);

	async function onDelete(userId: string) {
		const result = await deleteUser(userId);
		if (result.success) {
			await invalidateAll();
		} else {
			toast.error(result.error ?? 'Nutzer konnte nicht gelöscht werden.');
		}
	}

	async function onCancelInvite(verificationId: string) {
		await cancelInvite(verificationId);
		await invalidateAll();
	}
</script>

<div class="mx-5 mt-14 flex w-full max-w-7xl flex-col gap-10">
	<div class="flex flex-row items-center justify-between">
		<h1 class="text-2xl font-semibold">Benutzer</h1>
		<InviteUserDialog />
	</div>

	<div class="rounded-lg border">
		<table class="size-full">
			<thead>
				<tr class="border-b text-sm text-secondary-foreground/75">
					<th class="w-2/5 py-2 pl-4 text-left font-semibold">Name</th>
					<th class="py-2 text-left font-semibold">E-Mail</th>
					<th class="py-2 text-left font-semibold">Rolle</th>
					<th class="py-2 text-left font-semibold">Status</th>
					<th class="py-2 font-semibold"></th>
				</tr>
			</thead>
			<tbody>
				{#each users as user (user.id)}
					<tr class="border-b transition-colors duration-200 hover:bg-secondary">
						<td class="py-2 pl-4">{user.name}</td>
						<td class="py-2">{user.email}</td>
						<td class="py-2">{user.role}</td>
						<td class="py-2">
							<Badge variant={user.status === 'aktiv' ? 'secondary' : 'outline'}>
								{user.status}
							</Badge>
						</td>
						<td class="py-2 pr-4 text-right">
							{#if user.status === 'eingeladen'}
								<Button variant="ghost" size="sm" onclick={() => onCancelInvite(user.id)}>
									Einladung zurückziehen
								</Button>
							{:else if user.role !== 'admin'}
								<Button variant="ghost" size="sm" onclick={() => onDelete(user.id)}>Löschen</Button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
