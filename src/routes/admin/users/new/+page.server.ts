import { auth } from '$lib/server/auth';
import type { Actions } from './$types';
import { APIError } from 'better-auth';
import { fail } from '@sveltejs/kit';
import { generate } from 'short-uuid';

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const name = formData.get('name') as string;
		const tempPassword = generate();

		try {
			await auth.api.createUser({
				body: { email, name, password: tempPassword, role: 'user' },
				headers: request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return fail(400, { message: err.body?.message ?? 'Nutzer konnte nicht erstellt werden.' });
			}

			return fail(400, { message: 'Nutzer konnte nicht erstellt werden.' });
		}

		return { success: true, tempPassword, message: 'Nutzer wurde erstellt.' };
	}
};
