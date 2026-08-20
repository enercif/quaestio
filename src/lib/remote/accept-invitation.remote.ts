import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { invitation } from '$lib/server/db/auth.schema';
import { redirect } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import z from 'zod';

function findPendingInvitation(id: string) {
	return db.query.invitation.findFirst({
		where: and(
			eq(invitation.id, id),
			eq(invitation.status, 'pending'),
			gt(invitation.expiresAt, new Date())
		)
	});
}

export const getInvitationPreview = query(z.string(), async (id) => {
	const invite = await findPendingInvitation(id);
	return invite ? { email: invite.email } : undefined;
});

function toCookieHeader(headers: Headers) {
	return headers
		.getSetCookie()
		.map((cookie) => cookie.split(';')[0])
		.join('; ');
}

export const completeRegistration = form(
	z.object({
		invitationId: z.string(),
		name: z.string().min(1, 'Der Name darf nicht leer sein.'),
		password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
	}),
	async ({ invitationId, name, password }) => {
		const invite = await findPendingInvitation(invitationId);
		if (!invite) {
			return { success: false, error: 'Dieser Einladungslink ist ungültig oder abgelaufen.' };
		}

		const event = getRequestEvent();
		try {
			const { headers } = await auth.api.signUpEmail({
				body: { name, email: invite.email, password },
				headers: event.request.headers,
				returnHeaders: true
			});
			await auth.api.acceptInvitation({
				body: { invitationId },
				headers: new Headers({ cookie: toCookieHeader(headers) })
			});
		} catch (error) {
			console.error('Fehler bei der Registrierung:', error);
			return { success: false, error: 'Konto konnte nicht erstellt werden.' };
		}

		redirect(303, '/teacher/quizzes');
	}
);
