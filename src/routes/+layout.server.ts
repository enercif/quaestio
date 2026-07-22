import { getMemberRole } from '$lib/server/org';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const role = locals.user ? await getMemberRole(locals.user.id) : undefined;
	return { user: locals.user, role };
};
