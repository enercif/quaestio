import { command, query } from '$app/server';
import type { Quiz } from '$lib/schemas/quiz.schema';
import { roomInsertSchema, roomSelectSchema, type Room } from '$lib/schemas/room.schema';
import { db } from '$lib/server/db';
import { roomTable } from '$lib/server/db/schema';
import { removeNull } from '$lib/utils';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import z from 'zod';

export const findAllRooms = query(async () => {
	const rooms = await db.query.roomTable.findMany({
		with: {
			quiz: true
		}
	});
	const cleanedRooms = removeNull(rooms);
	return roomSelectSchema.array().parse(cleanedRooms);
});

export const insertRoom = command(roomInsertSchema, async (room) => {
	try {
		const [result] = await db.insert(roomTable).values(room).returning();
		const quiz = await db.query.quizTable.findFirst({
			where: (quiz, { eq }) => eq(quiz.id, room.quiz)
		});
		const cleanedQuiz = removeNull(quiz);
		const cleanedResult = removeNull(result);

		const roomSelect: Room = {
			id: cleanedResult.id,
			limit: cleanedResult.limit,
			quiz: cleanedQuiz as Quiz
		};
		return {
			success: true,
			room: roomSelectSchema.parse(roomSelect)
		};
	} catch (error) {
		console.error('Fehler beim Einfügen des Raums:', error);
		return {
			success: false,
			room: undefined
		};
	}
});

export const deleteRoomById = command(z.string(), async (id) => {
	try {
		await db.delete(roomTable).where(eq(roomTable.id, id));
		return {
			success: true
		};
	} catch (error) {
		console.error('Fehler beim Löschen des Raums:', error);
		return {
			success: false
		};
	}
});
