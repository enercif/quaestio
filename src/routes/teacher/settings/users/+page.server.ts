import { redirect } from '@sveltejs/kit';
import { listUsers } from '$lib/remote/users.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (user.role !== 'admin') {
		redirect(303, '/teacher/quizzes');
	}

	return { users: await listUsers() };
};
