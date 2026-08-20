import { findQuizById, findTagSuggestions } from '$lib/remote/quiz.remote';
import type { Quiz, QuizInsert } from '$lib/schemas/quiz.schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	try {
		const suggestions = await findTagSuggestions();

		if (id === 'new') {
			return {
				...returnInsertQuiz(),
				suggestions
			};
		}

		const quiz: Quiz | undefined = await findQuizById(id);

		if (!quiz) {
			return {
				...returnInsertQuiz(),
				suggestions
			};
		}

		return {
			quiz: quiz as QuizInsert,
			id: quiz.id,
			suggestions
		};
	} catch (error) {
		console.error('Fehler beim Laden des Quiz:', error);
		redirect(303, '/teacher/quizzes/new');
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
		questions_length: 0,
		visibility: 'public',
		practice_room: false
	};

	return {
		quiz: quizInsert,
		id: undefined
	};
}