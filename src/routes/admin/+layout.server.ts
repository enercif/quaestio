import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role != 'admin') {
		throw redirect(303, resolve('/login'));
	}

	return {
		user: locals.user
	};
};
