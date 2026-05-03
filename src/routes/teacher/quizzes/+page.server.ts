import { findAllQuizzes } from '$lib/remote/quiz.remote';
import { quizSelectSchema } from '$lib/schemas/quiz.schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const quizzes = await findAllQuizzes();
	return {
		quizzes: quizSelectSchema.array().parse(quizzes)
	};
};
