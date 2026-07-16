import { command, getRequestEvent, query } from '$app/server';
import { sendMail } from '$lib/server/mail';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { verification } from '$lib/server/db/auth.schema';
import { APIError } from 'better-auth';
import { and, eq, gt, like } from 'drizzle-orm';
import z from 'zod';

const INVITE_PREFIX = 'invite:';
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function requireAdmin() {
	const event = getRequestEvent();
	if (event.locals.user?.role !== 'admin') {
		throw new Error('Forbidden');
	}
	return event;
}

type UserRow = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: 'aktiv' | 'eingeladen';
	inviteUrl?: string;
};

export const listUsers = query(async (): Promise<UserRow[]> => {
	const event = requireAdmin();

	const { users } = await auth.api.listUsers({
		query: { limit: 200, sortBy: 'createdAt', sortDirection: 'desc' },
		headers: event.request.headers
	});

	const pendingInvites = await db
		.select()
		.from(verification)
		.where(
			and(
				like(verification.identifier, `${INVITE_PREFIX}%`),
				gt(verification.expiresAt, new Date())
			)
		);

	const knownEmails = new Set(users.map((u) => u.email));

	const invited: UserRow[] = pendingInvites
		.map((invite) => {
			const { email, name } = JSON.parse(invite.value) as { email: string; name: string };
			if (knownEmails.has(email)) return null;
			const token = invite.identifier.slice(INVITE_PREFIX.length);
			return {
				id: invite.id,
				name,
				email,
				role: 'teacher',
				status: 'eingeladen' as const,
				inviteUrl: `${event.url.origin}/register/${token}`
			};
		})
		.filter((row) => row !== null);

	const active: UserRow[] = users.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email,
		role: u.role ?? 'teacher',
		status: 'aktiv' as const
	}));

	return [...active, ...invited];
});

export const inviteUser = command(
	z.object({ name: z.string().min(1, 'Der Name darf nicht leer sein.'), email: z.email() }),
	async ({ name, email }) => {
		const event = requireAdmin();

		const { users } = await auth.api.listUsers({
			query: { limit: 200, sortBy: 'createdAt', sortDirection: 'desc' },
			headers: event.request.headers
		});
		if (users.some((u) => u.email === email)) {
			return {
				success: false as const,
				error: 'Es existiert bereits ein Account mit dieser E-Mail.'
			};
		}

		const token = crypto.randomUUID();
		await db.insert(verification).values({
			id: crypto.randomUUID(),
			identifier: `${INVITE_PREFIX}${token}`,
			value: JSON.stringify({ email, name }),
			expiresAt: new Date(Date.now() + INVITE_TTL_MS)
		});

		return { success: true as const, url: `${event.url.origin}/register/${token}` };
	}
);

export const sendInviteEmail = command(
	z.object({ email: z.email(), name: z.string(), url: z.string() }),
	async ({ email, name, url }) => {
		requireAdmin();
		return sendMail({
			to: email,
			subject: 'Einladung zu Quaestio',
			html: `<p>Hallo ${name},</p><p>du wurdest eingeladen, ein Lehrer-Konto bei Quaestio zu erstellen.</p><p><a href="${url}">${url}</a></p>`
		});
	}
);

export const cancelInvite = command(z.string(), async (verificationId) => {
	requireAdmin();
	await db.delete(verification).where(eq(verification.id, verificationId));
	return { success: true };
});

export const deleteUser = command(z.string(), async (userId) => {
	const event = requireAdmin();

	if (event.locals.user?.id === userId) {
		return { success: false as const, error: 'Du kannst dich nicht selbst löschen.' };
	}

	try {
		await auth.api.removeUser({ body: { userId }, headers: event.request.headers });
		return { success: true as const };
	} catch (error) {
		console.error('Fehler beim Löschen des Nutzers:', error);
		const message = error instanceof APIError ? error.body?.message : undefined;
		return { success: false as const, error: message ?? 'Nutzer konnte nicht gelöscht werden.' };
	}
});
