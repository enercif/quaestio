import { findQuizById } from '$lib/remote/quiz.remote';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const quiz = await findQuizById(params.id);
	if (!quiz) error(404, 'Quiz nicht gefunden.');
	return { quiz };
};
