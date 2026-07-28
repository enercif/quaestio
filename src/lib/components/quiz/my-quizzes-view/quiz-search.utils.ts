import Fuse, { type FuseOptionKey } from 'fuse.js';
import type { Quiz } from '$lib/schemas/quiz.schema';

export type SearchType = 'default' | 'title' | 'tag' | 'question';

function createFuse(quizzes: Quiz[], keys: FuseOptionKey<Quiz>[]) {
	return new Fuse(quizzes, {
		keys,
		threshold: 0.35,
		ignoreLocation: true
	});
}

export function createQuizSearch(quizzes: Quiz[]) {
	const all = createFuse(quizzes, [
		'title',
		'tags',
		'questions.question',
		'questions.answers.text',
		'questions.hint',
		'questions.correct',
		'questions.code',
		'questions.language',
		'questions.resources.label',
		// Extract reason texts from Record<string, string> for Fuse search
		{
			name: 'questions.reasons',
			getFn: (quiz) =>
				quiz.questions.flatMap((question) =>
					question.reasons ? Object.values(question.reasons) : []
				)
		}
	]);

	const title = createFuse(quizzes, ['title']);

	const tag = createFuse(quizzes, ['tags']);

	const question = createFuse(quizzes, ['questions.question']);

	return {
		search(query: string, type: SearchType = 'default') {
			const trimmed = query.trim();

			if (!trimmed) {
				return quizzes;
			}

			switch (type) {
				case 'title':
					return title.search(trimmed).map((result) => result.item);

				case 'tag':
					return tag.search(trimmed).map((result) => result.item);

				case 'question':
					return question.search(trimmed).map((result) => result.item);

				default:
					return all.search(trimmed).map((result) => result.item);
			}
		}
	};
}
