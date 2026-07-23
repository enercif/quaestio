import { command, query } from '$app/server';
import {
	answerAccuracy,
	computedPoints,
	correctAnswersFor,
	questionMaxPoints
} from '$lib/components/quiz/quiz.utils';
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

	const quiz = quizSelectSchema.parse(room.quiz);
	const questions = quiz.questions.toSorted((a, b) => a.position - b.position);
	const answers = await db.query.answerTable.findMany({
		where: (answer, { eq }) => eq(answer.room_id, roomId)
	});

	const studentIds = [...new Set(answers.map((a) => a.student_id))];

	const students = studentIds
		.map((studentId) => {
			const studentName = answers.find((a) => a.student_id === studentId)!.student_name;
			const questionResults = questions.map((question) => {
				const answer = answers.find(
					(a) => a.student_id === studentId && a.question_id === question.id
				);
				const auto = answer ? computedPoints(question, answer.selected) : 0;
				return {
					answerId: answer?.id,
					questionId: question.id,
					question: question.question,
					type: question.type,
					correct: Object.values(question.correct),
					maxPoints: questionMaxPoints(question),
					selected: answer?.selected ?? [],
					points: answer?.points_override ?? auto,
					overridden: answer?.points_override != null
				};
			});
			return {
				studentId,
				studentName,
				questions: questionResults,
				totalPoints: questionResults.reduce((sum, q) => sum + q.points, 0)
			};
		})
		.sort((a, b) => a.studentName.localeCompare(b.studentName));

	const questionStats = questions.map((question, index) => {
		const max = questionMaxPoints(question);
		const selections = students.map((s) => s.questions[index].selected);
		const accuracy =
			selections.length > 0
				? (selections.reduce((sum, selected) => sum + answerAccuracy(question, selected), 0) /
						selections.length) *
					100
				: 0;

		return {
			questionId: question.id,
			position: index,
			question: question.question,
			type: question.type,
			maxPoints: max,
			accuracy,
			answers:
				question.type === 'multiple' || question.type === 'single'
					? question.answers.map((a) => ({
							id: a.id,
							text: a.text,
							correct: correctAnswersFor(question).includes(a.text)
						}))
					: undefined,
			code: question.type === 'programming' ? question.code : undefined,
			language: question.type === 'programming' ? question.language : undefined,
			correctLines: question.type === 'programming' ? question.correct : undefined
		};
	});

	return {
		room: { id: room.id, code: room.code, createdAt: room.created_at },
		quiz: { id: quiz.id, title: quiz.title },
		questionStats,
		students
	};
});

export const getStudentRooms = query(z.string(), async (studentId) => {
	const answers = await db.query.answerTable.findMany({
		where: (answer, { eq }) => eq(answer.student_id, studentId),
		with: { room: { with: { quiz: true } } }
	});
	if (answers.length === 0) return undefined;

	const studentName = answers[0].student_name;
	const roomIds = [...new Set(answers.map((a) => a.room_id))];

	const rooms = roomIds
		.map((roomId) => {
			const roomAnswers = answers.filter((a) => a.room_id === roomId);
			const room = roomAnswers[0].room;
			const quiz = quizSelectSchema.parse(room.quiz);
			const questions = quiz.questions.toSorted((a, b) => a.position - b.position);

			const questionResults = questions.map((question) => {
				const answer = roomAnswers.find((a) => a.question_id === question.id);
				const selected = answer?.selected ?? [];
				const auto = answer ? computedPoints(question, selected) : 0;
				return {
					answerId: answer?.id,
					questionId: question.id,
					question: question.question,
					type: question.type,
					maxPoints: questionMaxPoints(question),
					correct: Object.values(question.correct),
					selected,
					points: answer?.points_override ?? auto,
					overridden: answer?.points_override != null,
					accuracy: answerAccuracy(question, selected) * 100
				};
			});

			return {
				roomId,
				code: room.code,
				createdAt: room.created_at,
				quizTitle: quiz.title,
				questions: questionResults
			};
		})
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

	return { studentId, studentName, rooms };
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
