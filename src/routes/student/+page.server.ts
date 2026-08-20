import { findPracticeQuizzes } from '$lib/remote/quiz.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { quizzes: await findPracticeQuizzes() };
};
