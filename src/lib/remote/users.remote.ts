import { command, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { sendMail } from '$lib/server/mail';
import { getMemberRole, getMemberRoleById, requireOrgAdmin, type OrgRole } from '$lib/server/org';
import { APIError } from 'better-auth';
import { eq } from 'drizzle-orm';
import z from 'zod';

const roleSchema = z.enum(['owner', 'admin', 'member']);

type UserRow = {
	id: string;
	memberId?: string;
	name: string;
	email: string;
	role: OrgRole;
	status: 'aktiv' | 'eingeladen';
	inviteUrl?: string;
};

export const listUsers = query(async (): Promise<UserRow[]> => {
	const { event } = await requireOrgAdmin();
	const headers = event.request.headers;

	const { members } = await auth.api.listMembers({
		query: { sortBy: 'createdAt', sortDirection: 'desc' },
		headers
	});
	const invitations = await auth.api.listInvitations({
		headers
	});

	const active: UserRow[] = members.map((m) => ({
		id: m.userId,
		memberId: m.id,
		name: m.user.name,
		email: m.user.email,
		role: m.role as OrgRole,
		status: 'aktiv' as const
	}));

	const invited: UserRow[] = invitations
		.filter((i) => i.status === 'pending')
		.map((i) => ({
			id: i.id,
			name: i.email,
			email: i.email,
			role: i.role as OrgRole,
			status: 'eingeladen' as const,
			inviteUrl: `${event.url.origin}/accept-invitation/${i.id}`
		}));

	return [...active, ...invited];
});

export const inviteUser = command(
	z.object({ email: z.email(), role: roleSchema }),
	async ({ email, role }) => {
		const { event, role: callerRole } = await requireOrgAdmin();
		if (role === 'owner' && callerRole !== 'owner') {
			return { success: false as const, error: 'Nur Owner können die Owner-Rolle vergeben.' };
		}

		try {
			const invitation = await auth.api.createInvitation({
				body: { email, role },
				headers: event.request.headers
			});
			void listUsers().refresh();
			return {
				success: true as const,
				url: `${event.url.origin}/accept-invitation/${invitation.id}`
			};
		} catch (error) {
			const message = error instanceof APIError ? error.body?.message : undefined;
			return {
				success: false as const,
				error: message ?? 'Einladung konnte nicht erstellt werden.'
			};
		}
	}
);

export const sendInviteEmail = command(
	z.object({ email: z.email(), url: z.string() }),
	async ({ email, url }) => {
		await requireOrgAdmin();
		return sendMail({
			to: email,
			subject: 'Einladung zu Quaestio',
			html: `<p>Hallo,</p><p>du wurdest eingeladen, ein Konto bei Quaestio zu erstellen.</p><p><a href="${url}">${url}</a></p>`
		});
	}
);

export const cancelInvite = command(z.string(), async (invitationId) => {
	const { event } = await requireOrgAdmin();
	try {
		await auth.api.cancelInvitation({
			body: { invitationId },
			headers: event.request.headers
		});
		void listUsers().refresh();
		return { success: true };
	} catch (error) {
		console.error('Fehler beim Zurückziehen der Einladung:', error);
		return { success: false };
	}
});

export const updateMemberRole = command(
	z.object({ memberId: z.string(), role: roleSchema }),
	async ({ memberId, role }) => {
		const { event, role: callerRole } = await requireOrgAdmin();
		const currentRole = await getMemberRoleById(memberId);
		const touchesOwnerRank = role === 'owner' || currentRole === 'owner';
		if (touchesOwnerRank && callerRole !== 'owner') {
			return {
				success: false as const,
				error: 'Nur Owner können die Owner-Rolle vergeben oder entziehen.'
			};
		}

		try {
			await auth.api.updateMemberRole({
				body: { memberId, role },
				headers: event.request.headers
			});
			void listUsers().refresh();
			return { success: true as const };
		} catch (error) {
			const message = error instanceof APIError ? error.body?.message : undefined;
			return { success: false as const, error: message ?? 'Rolle konnte nicht geändert werden.' };
		}
	}
);

export const deleteUser = command(z.string(), async (userId) => {
	const { event } = await requireOrgAdmin();

	if (event.locals.user?.id === userId) {
		return { success: false as const, error: 'Du kannst dich nicht selbst löschen.' };
	}
	if ((await getMemberRole(userId)) === 'owner') {
		return { success: false as const, error: 'Der Owner kann nicht gelöscht werden.' };
	}

	await db.delete(user).where(eq(user.id, userId));
	void listUsers().refresh();
	return { success: true as const };
});
