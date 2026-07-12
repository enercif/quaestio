import { findQuizById } from '$lib/remote/quiz.remote';
import type { Quiz, QuizInsert } from '$lib/schemas/quiz.schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	if (id === 'new') {
		return returnInsertQuiz();
	} else {
		try {
			const quiz: Quiz | undefined = await findQuizById(id);

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
			redirect(303, '/teacher/quizzes/new');
		}
	}
};

function returnInsertQuiz(): {
	quiz: QuizInsert;
	id: undefined;
} {
	const quizInsert: QuizInsert = {
		title: '',
		tags: [],
		questions: [],
		questions_length: 0
	};

	return {
		quiz: quizInsert,
		id: undefined
	};
}
