import { redirect } from '@sveltejs/kit';
import { isOrgAdmin } from '$lib/server/org';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { role } = await parent();
	if (!isOrgAdmin(role)) {
		redirect(303, '/teacher/quizzes');
	}
};
