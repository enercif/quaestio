import { command, getRequestEvent } from '$app/server';
import { auth } from '$lib/server/auth';
import { createAdminAccount, hasAnyUser } from '$lib/server/setup';
import z from 'zod';

export const createFirstAdmin = command(
	z.object({
		name: z.string().min(1, 'Der Name darf nicht leer sein.'),
		email: z.email(),
		password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
	}),
	async ({ name, email, password }) => {
		if (await hasAnyUser()) {
			return { success: false as const, error: 'Es existiert bereits ein Konto.' };
		}

		await createAdminAccount(name, email, password);

		const event = getRequestEvent();
		try {
			await auth.api.signInEmail({ body: { email, password }, headers: event.request.headers });
		} catch (error) {
			console.error('Fehler beim automatischen Login nach Setup:', error);
			return {
				success: false as const,
				error: 'Konto wurde erstellt, automatischer Login ist fehlgeschlagen. Bitte einloggen.'
			};
		}

		return { success: true as const };
	}
);
