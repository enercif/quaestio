import { command, getRequestEvent, query } from '$app/server';
import { canEditQuiz } from '$lib/components/quiz/quiz.utils';
import { quizInsertSchema, quizSelectSchema, quizUpdateSchema } from '$lib/schemas/quiz.schema';
import { db } from '$lib/server/db';
import { quizTable } from '$lib/server/db/schema';
import { eq, isNull } from 'drizzle-orm';
import z from 'zod';

export const findQuizById = query(z.uuid(), async (quizId: string) => {
	const { locals } = getRequestEvent();
	const quiz = await db.query.quizTable.findFirst({
		where: (quiz, { eq, and, isNull }) => and(eq(quiz.id, quizId), isNull(quiz.deleted_at))
	});

	const isOwner = locals.user?.id === quiz?.teacherId;
	if (!isOwner && quiz?.visibility !== 'public') return undefined;

	return quiz ? quizSelectSchema.parse(quiz) : undefined;
});

export const findPracticeQuizzes = query(async () => {
	const quizzes = await db.query.quizTable.findMany({
		where: (quiz, { eq, and }) =>
			and(isNull(quiz.deleted_at), eq(quiz.visibility, 'public'), eq(quiz.practice_room, true))
	});
	return quizSelectSchema.array().parse(quizzes);
});

export const findPracticeQuizById = query(z.uuid(), async (quizId: string) => {
	const quiz = await db.query.quizTable.findFirst({
		where: (quiz, { eq, and }) =>
			and(
				eq(quiz.id, quizId),
				isNull(quiz.deleted_at),
				eq(quiz.visibility, 'public'),
				eq(quiz.practice_room, true)
			)
	});
	return quiz ? quizSelectSchema.parse(quiz) : undefined;
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
	return quizSelectSchema.array().parse(quizzes);
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

		return {
			success: true,
			quiz: quizSelectSchema.parse(result)
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

		if (!canEditQuiz(locals.user.id, quizToUpdate)) {
			return { success: false, quiz: undefined };
		}

		const [updatedQuiz] = await db
			.update(quizTable)
			.set(quiz)
			.where(eq(quizTable.id, quiz.id))
			.returning();
		return {
			success: true,
			quiz: quizSelectSchema.parse(updatedQuiz)
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

		if (!canEditQuiz(locals.user.id, quizToDelete)) {
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
