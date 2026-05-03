import { findQuizById } from '$lib/remote/quiz.remote';
import type { Quiz, QuizInsert } from '$lib/schemas/quiz.schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { quizId } = params;

	if (quizId === 'new') {
		return returnInsertQuiz();
	} else {
		try {
			const quiz: Quiz | undefined = await findQuizById(quizId);

			if (!quiz) {
				return returnInsertQuiz();
			} else {
				return {
					quiz: quiz as QuizInsert,
					id: quiz.id
				};
			}
		} catch (error) {
			console.error('Fehler beim Laden des Quiz:', error);

			return returnInsertQuiz();
		}
	}
};

function returnInsertQuiz(): {
	quiz: QuizInsert;
	id: undefined;
} {
	const quizInsert: QuizInsert = {
		title: '',
		last_run: null,
		tags: [],
		questions: []
	};

	return {
		quiz: quizInsert,
		id: undefined
	};
}
