import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { verification } from '$lib/server/db/auth.schema';
import { redirect } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import z from 'zod';

const INVITE_PREFIX = 'invite:';

async function findInvite(token: string) {
	const row = await db.query.verification.findFirst({
		where: and(
			eq(verification.identifier, `${INVITE_PREFIX}${token}`),
			gt(verification.expiresAt, new Date())
		)
	});
	if (!row) return undefined;
	return { row, ...(JSON.parse(row.value) as { email: string; name: string }) };
}

export const getInviteByToken = query(z.string(), async (token) => {
	const invite = await findInvite(token);
	return invite ? { email: invite.email, name: invite.name } : undefined;
});

export const completeRegistration = form(
	z.object({
		token: z.string(),
		password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
	}),
	async ({ token, password }) => {
		const invite = await findInvite(token);
		if (!invite) {
			return { success: false, error: 'Dieser Einladungslink ist ungültig oder abgelaufen.' };
		}

		const event = getRequestEvent();
		try {
			await auth.api.signUpEmail({
				body: { name: invite.name, email: invite.email, password },
				headers: event.request.headers
			});
		} catch (error) {
			console.error('Fehler bei der Registrierung:', error);
			return { success: false, error: 'Konto konnte nicht erstellt werden.' };
		}

		await db.delete(verification).where(eq(verification.id, invite.row.id));
		redirect(303, '/teacher/quizzes');
	}
);
