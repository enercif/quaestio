<script lang="ts">
	import InviteUserDialog from '$lib/components/admin/invite-user-dialog.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { cancelInvite, deleteUser, listUsers, updateMemberRole } from '$lib/remote/users.remote';
	import { roleLabels, type OrgRole } from '$lib/types/org-role.type';
	import { toast } from 'svelte-sonner';

	const users = $derived(await listUsers());

	async function onDelete(userId: string) {
		const result = await deleteUser(userId);
		if (!result.success) {
			toast.error(result.error ?? 'Nutzer konnte nicht gelöscht werden.');
		}
	}

	async function onCancelInvite(invitationId: string) {
		await cancelInvite(invitationId);
	}

	async function onRoleChange(memberId: string, role: OrgRole) {
		const result = await updateMemberRole({ memberId, role });
		if (!result.success) {
			toast.error(result.error ?? 'Rolle konnte nicht geändert werden.');
		}
	}
</script>

<div class="flex w-full flex-col gap-4">
	<div class="flex flex-row items-center justify-end">
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
						<td class="py-2">
							{#if user.status === 'aktiv' && user.memberId}
								{@const memberId = user.memberId}
								<Select.Root
									type="single"
									value={user.role}
									onValueChange={(value) => onRoleChange(memberId, value as OrgRole)}
								>
									<Select.Trigger class="w-32">{roleLabels[user.role]}</Select.Trigger>
									<Select.Content>
										<Select.Item value="member">{roleLabels.member}</Select.Item>
										<Select.Item value="admin">{roleLabels.admin}</Select.Item>
										<Select.Item value="owner">{roleLabels.owner}</Select.Item>
									</Select.Content>
								</Select.Root>
							{:else}
								{roleLabels[user.role]}
							{/if}
						</td>
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
							{:else if user.role !== 'owner'}
								<Button variant="ghost" size="sm" onclick={() => onDelete(user.id)}>Löschen</Button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
