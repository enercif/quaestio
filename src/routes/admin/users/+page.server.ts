import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { APIError } from 'better-auth';

export const load: PageServerLoad = async ({ request }) => {
	try {
		const { users } = await auth.api.listUsers({
			query: { limit: 100, sortBy: 'createdAt', sortDirection: 'desc' },
			headers: request.headers
		});
		return { users };
	} catch (err) {
		console.error(err);
		return { users: [], message: 'Nutzer konnten nicht geladen werden.' };
	}
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');

		if (locals.user?.id === userId) {
			return fail(400, { message: 'Du kannst dich nicht selbst löschen.' });
		}

		try {
			await auth.api.removeUser({ body: { userId }, headers: request.headers });
		} catch (err) {
			console.error(err);
			if (err instanceof APIError) {
				return fail(400, { message: err.body?.message ?? 'Nutzer konnte nicht gelöscht werden.' });
			}

			return fail(500, { message: 'Ein unerwarteter Fehler is aufgetreten.' });
		}
	}
};
