import { redirect } from '@sveltejs/kit';
import { isOrgAdmin } from '$lib/server/org';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { role } = await parent();
	if (!isOrgAdmin(role)) {
		redirect(303, '/teacher/quizzes');
	}
};
