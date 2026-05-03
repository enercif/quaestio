import { command, query } from '$app/server';
import { quizInsertSchema, quizSelectSchema, quizUpdateSchema } from '$lib/schemas/quiz.schema';
import { db } from '$lib/server/db';
import { quizTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const findQuizById = query(z.uuid(), async (quizId: string) => {
	const quiz = await db.query.quizTable.findFirst({
		where: (quiz, { eq }) => eq(quiz.id, quizId)
	});

	return quiz ? quizSelectSchema.parse(quiz) : undefined;
});

export const findAllQuizzes = query(async () => {
	return await db.query.quizTable.findMany();
});

export const insertQuiz = command(quizInsertSchema, async (quiz) => {
	try {
		const result = await db.insert(quizTable).values(quiz).returning();
		return {
			success: true,
			quiz: quizSelectSchema.parse(result[0])
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
	try {
		await db.update(quizTable).set(quiz).where(eq(quizTable.id, quiz.id));
		return {
			success: true,
			quiz: quizSelectSchema.parse(quiz)
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
	try {
		await db.delete(quizTable).where(eq(quizTable.id, quizId));
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
