import { command, query } from '$app/server';
import { analyticsRoomSchema, analyticsStudentSchema } from '$lib/schemas/analytics.schema';
import { db } from '$lib/server/db';
import { answerTable, quizTable, roomTable } from '$lib/server/db/schema';
import { countDistinct, eq } from 'drizzle-orm';
import z from 'zod';

export const listAnswerRooms = query(async () => {
	const list = await db
		.select({
			id: roomTable.id,
			studentCount: countDistinct(answerTable.student_id),
			title: quizTable.title,
			code: roomTable.code,
			createdAt: roomTable.created_at
		})
		.from(answerTable)
		.innerJoin(roomTable, eq(answerTable.room_id, roomTable.id))
		.innerJoin(quizTable, eq(roomTable.quiz_id, quizTable.id))
		.groupBy(roomTable.id, quizTable.title, roomTable.code, roomTable.created_at);
	return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

export const getRoomAnalytics = query(z.uuid(), async (roomId) => {
	const room = await db.query.roomTable.findFirst({
		where: (room, { eq }) => eq(room.id, roomId),
		with: { quiz: true }
	});
	if (!room) return undefined;

	const answers = await db.query.answerTable.findMany({
		where: (answer, { eq }) => eq(answer.room_id, roomId)
	});

	if (answers.length === 0) return undefined;

	try {
		return analyticsRoomSchema.parse({
			room,
			quiz: room.quiz,
			answers
		});
	} catch (error) {
		console.error('Error parsing analyticsRoomSchema:', error);
		return undefined;
	}
});

export const listAnswerStudents = query(async () => {
	const students = await db
		.select({
			id: answerTable.student_id,
			name: answerTable.student_name,
			roomCount: countDistinct(answerTable.room_id)
		})
		.from(answerTable)
		.groupBy(answerTable.student_id, answerTable.student_name);

	return students;
});

export const getStudentAnalytics = query(z.string(), async (studentId) => {
	const answers = await db.query.answerTable.findMany({
		where: (answer, { eq }) => eq(answer.student_id, studentId)
	});
	if (answers.length === 0) return undefined;

	const rooms = await db.query.roomTable.findMany({
		where: (room, { inArray }) => inArray(room.id, [...new Set(answers.map((a) => a.room_id))]),
		with: { quiz: true },
		orderBy: (room, { desc }) => desc(room.created_at)
	});

	if (rooms.length === 0) return undefined;

	try {
		return analyticsStudentSchema.parse({
			id: answers[0].student_id,
			name: answers[0].student_name,
			rooms: rooms.map((room) => ({
				...room,
				answers: answers.filter((a) => a.room_id === room.id)
			}))
		});
	} catch (error) {
		console.error('Error parsing analyticsStudentSchema:', error);
		return undefined;
	}
});

export const setPointsOverride = command(
	z.object({ answerId: z.uuid(), points: z.number().min(0).nullable() }),
	async ({ answerId, points }) => {
		const [answer] = await db
			.update(answerTable)
			.set({ points_override: points })
			.where(eq(answerTable.id, answerId))
			.returning();
		if (!answer) return { success: false as const };

		void getRoomAnalytics(answer.room_id).refresh();
		void getStudentAnalytics(answer.student_id).refresh();
		return { success: true as const };
	}
);
