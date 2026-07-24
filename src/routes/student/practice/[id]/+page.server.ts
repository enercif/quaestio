import { findPracticeQuizById } from '$lib/remote/quiz.remote';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const quiz = await findPracticeQuizById(params.id);
	if (!quiz) error(404, 'Dieser Übungsraum ist nicht verfügbar.');
	return { quiz };
};
