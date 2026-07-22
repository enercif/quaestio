import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const { role } = await parent();
	if (!locals.user || !role) {
		redirect(303, '/login');
	}

	return { user: locals.user, role };
};
