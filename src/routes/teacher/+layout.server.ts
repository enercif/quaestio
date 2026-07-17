import { redirect } from '@sveltejs/kit';
import { getMemberRole } from '$lib/server/org';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const role = locals.user ? await getMemberRole(locals.user.id) : undefined;
	if (!locals.user || !role) {
		redirect(303, '/login');
	}

	return { user: locals.user, role };
};
