import { command, getRequestEvent, query } from '$app/server';
import { quizInsertSchema, quizSelectSchema, quizUpdateSchema } from '$lib/schemas/quiz.schema';
import { db } from '$lib/server/db';
import { quizTable } from '$lib/server/db/schema';
import { removeNull } from '$lib/utils';
import { eq, isNull } from 'drizzle-orm';
import z from 'zod';

export const findQuizById = query(z.uuid(), async (quizId: string) => {
	const { locals } = getRequestEvent();
	const quiz = await db.query.quizTable.findFirst({
		where: (quiz, { eq, and, isNull }) => and(eq(quiz.id, quizId), isNull(quiz.deleted_at))
	});

	const isOwner = locals.user?.id === quiz?.teacherId;
	if (!isOwner && quiz?.visibility !== 'public') return undefined;

	const cleanedQuiz = removeNull(quiz);
	return quiz ? quizSelectSchema.parse(cleanedQuiz) : undefined;
});

export const findAllQuizzes = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return [];

	const quizzes = await db.query.quizTable.findMany({
		where: (quiz, { eq, or, and }) =>
			and(
				isNull(quiz.deleted_at),
				or(eq(quiz.teacherId, locals.user!.id), eq(quiz.visibility, 'public'))
			)
	});

	const cleanedQuizzes = removeNull(quizzes);
	return quizSelectSchema.array().parse(cleanedQuizzes);
});

export const insertQuiz = command(quizInsertSchema, async (quiz) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return { success: false, quiz: undefined };
	}

	try {
		const [result] = await db
			.insert(quizTable)
			.values({ ...quiz, teacherId: locals.user.id })
			.returning();

		const cleanedResult = removeNull(result);
		return {
			success: true,
			quiz: quizSelectSchema.parse(cleanedResult)
		};
	} catch (error) {
		console.error('Fehler beim Einfügen des Quiz:', error);
		return {
			success: false,
			quiz: undefined
		};
	}
});

export const updateQuiz = command(quizUpdateSchema, async (quiz) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return { success: false, quiz: undefined };
	}

	try {
		const quizToUpdate = await db.query.quizTable.findFirst({
			where: (q, { eq }) => eq(q.id, quiz.id)
		});

		const isOwner = quizToUpdate?.teacherId === locals.user.id;
		const isPublicQuiz = quizToUpdate?.visibility === 'public';

		if (!quizToUpdate || (!isOwner && !isPublicQuiz)) {
			return { success: false, quiz: undefined };
		}

		const [updatedQuiz] = await db
			.update(quizTable)
			.set(quiz)
			.where(eq(quizTable.id, quiz.id))
			.returning();
		const cleanedUpdatedQuiz = removeNull(updatedQuiz);
		return {
			success: true,
			quiz: quizSelectSchema.parse(cleanedUpdatedQuiz)
		};
	} catch (error) {
		console.error('Fehler beim Aktualisieren des Quiz:', error);
		return {
			success: false,
			quiz: undefined
		};
	}
});

export const deleteQuizById = command(z.uuid(), async (quizId: string) => {
	const { locals } = getRequestEvent();
	if (!locals.user) {
		return { success: false };
	}

	try {
		const quizToDelete = await db.query.quizTable.findFirst({
			where: (q, { eq }) => eq(q.id, quizId)
		});

		const isOwner = quizToDelete?.teacherId === locals.user.id;
		const isPublicQuiz = quizToDelete?.visibility === 'public';
		if (!quizToDelete || (!isOwner && !isPublicQuiz)) {
			return { success: false };
		}

		await db
			.update(quizTable)
			.set({ deleted_at: new Date().toISOString() })
			.where(eq(quizTable.id, quizId));
		return {
			success: true
		};
	} catch (error) {
		console.error('Fehler beim Löschen des Quiz:', error);
		return {
			success: false
		};
	}
});
