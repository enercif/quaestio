import { command, query } from '$app/server';
import { quizSelectSchema } from '$lib/schemas/quiz.schema';
import { db } from '$lib/server/db';
import { answerTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import z from 'zod';

export const listAnswerRooms = query(async () => {
	const rooms = await db
		.select({
			id: answerTable.room_id,
			studentCount: sql<number>`count(distinct ${answerTable.student_id})`.mapWith(Number),
			answerCount: sql<number>`count(*)`.mapWith(Number)
		})
		.from(answerTable)
		.groupBy(answerTable.room_id);

	const details = await db.query.roomTable.findMany({
		where: (room, { inArray }) =>
			inArray(
				room.id,
				rooms.map((r) => r.id)
			),
		with: { quiz: { columns: { id: true, title: true } } }
	});
	const detailsById = new Map(details.map((d) => [d.id, d]));

	return rooms
		.map((r) => {
			const room = detailsById.get(r.id);
			if (!room) return undefined;
			return {
				id: room.id,
				code: room.code,
				createdAt: room.created_at,
				quizTitle: room.quiz.title,
				studentCount: r.studentCount,
				answerCount: r.answerCount
			};
		})
		.filter((r) => r !== undefined)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

export const listAnswerStudents = query(async () => {
	const students = await db
		.select({
			id: answerTable.student_id,
			name: sql<string>`min(${answerTable.student_name})`,
			roomCount: sql<number>`count(distinct ${answerTable.room_id})`.mapWith(Number)
		})
		.from(answerTable)
		.groupBy(answerTable.student_id);

	return students.sort((a, b) => a.name.localeCompare(b.name));
});

export const getRoomAnalysis = query(z.uuid(), async (roomId) => {
	const room = await db.query.roomTable.findFirst({
		where: (room, { eq }) => eq(room.id, roomId),
		with: { quiz: true }
	});
	if (!room) return undefined;

	const answers = await db.query.answerTable.findMany({
		where: (answer, { eq }) => eq(answer.room_id, roomId)
	});

	return {
		room: { id: room.id, code: room.code, createdAt: room.created_at },
		quiz: quizSelectSchema.parse(room.quiz),
		answers
	};
});

export const getStudentRooms = query(z.string(), async (studentId) => {
	const answers = await db.query.answerTable.findMany({
		where: (answer, { eq }) => eq(answer.student_id, studentId)
	});
	if (answers.length === 0) return undefined;

	const studentName = answers[0].student_name;
	const roomIds = [...new Set(answers.map((a) => a.room_id))];

	const roomRows = await db.query.roomTable.findMany({
		where: (room, { inArray }) => inArray(room.id, roomIds),
		with: { quiz: true }
	});
	const roomById = new Map(roomRows.map((r) => [r.id, r]));

	const rooms = roomIds
		.map((roomId) => {
			const room = roomById.get(roomId)!;
			return {
				room: { id: room.id, code: room.code, createdAt: room.created_at },
				quiz: quizSelectSchema.parse(room.quiz),
				answers: answers.filter((a) => a.room_id === roomId)
			};
		})
		.sort((a, b) => b.room.createdAt.localeCompare(a.room.createdAt));

	return { studentName, rooms };
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

		void getRoomAnalysis(answer.room_id).refresh();
		void getStudentRooms(answer.student_id).refresh();
		return { success: true as const };
	}
);
