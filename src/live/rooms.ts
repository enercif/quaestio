import { answerSelectSchema, answerSubmitSchema } from '$lib/schemas/answer.schema';
import { liveQuestionSchema, questionsSchema } from '$lib/schemas/question.schema';
import {
	roomInsertSchema,
	roomSelectSchema,
	RoomState,
	type Room,
	type RoomInsert
} from '$lib/schemas/room.schema';
import { db } from '$lib/server/db';
import { answerTable, roomTable } from '$lib/server/db/schema';
import { addStudent, hasStudent, removeStudent, studentCount } from '$lib/server/occupancy';
import { TOPICS } from '$lib/server/topics';
import type { PresenceUser } from '$lib/types/presence.type';
import type { User } from '$lib/types/user.type';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { live, LiveError, type LiveContext } from 'svelte-realtime';

export async function getRooms(): Promise<Room[]> {
	const rooms = await db.query.roomTable.findMany({
		with: {
			quiz: {
				columns: {
					title: true,
					questions_length: true,
					id: true
				}
			}
		}
	});
	return roomSelectSchema.array().parse(rooms);
}

export async function getRoomById(roomId: string): Promise<Room | undefined> {
	const room = await db.query.roomTable.findFirst({
		with: {
			quiz: {
				columns: {
					title: true,
					questions_length: true,
					id: true
				}
			}
		},
		where: (room, { eq }) => eq(room.id, roomId)
	});
	return room ? roomSelectSchema.parse(room) : undefined;
}

export const rooms = live.stream(
	TOPICS.rooms,
	async () => {
		return getRooms();
	},
	{ merge: 'crud', key: 'id' }
);

export const insertRoom = live.validated(
	roomInsertSchema,
	async (ctx: LiveContext<User>, roomInsert: RoomInsert) => {
		if (!ctx.user) throw new LiveError('UNAUTHORIZED', 'User not authenticated');
		try {
			const [{ id }] = await db
				.insert(roomTable)
				.values(roomInsert)
				.returning({ id: roomTable.id });

			const room = await getRoomById(id);
			if (!room) {
				throw new LiveError('NOT_FOUND', 'Room not found');
			}

			ctx.publish(TOPICS.rooms, 'created', room);
			return true;
		} catch (error) {
			console.error('Fehler beim Einfügen des Raums:', error);
			throw new LiveError('DB', 'Error occurred while inserting room');
		}
	}
);

export const deleteRoom = live(async (ctx: LiveContext<User>, roomId: string) => {
	if (!ctx.user) throw new LiveError('UNAUTHORIZED', 'User not authenticated');
	try {
		const room = await getRoomById(roomId);
		if (!room) {
			throw new LiveError('NOT_FOUND', 'Room not found');
		}
		room.state = RoomState.Finished;

		await db.delete(roomTable).where(eq(roomTable.id, roomId)).returning();
		ctx.publish(TOPICS.rooms, 'deleted', { id: roomId });
		ctx.publish(TOPICS.room(roomId), 'set', room);

		return true;
	} catch (error) {
		console.error('Fehler beim Löschen des Raums:', error);
		throw new LiveError('DB', 'Error occurred while deleting room');
	}
});

function requireTeacher(ctx: LiveContext<User>) {
	if (ctx.user?.type !== 'teacher') throw new LiveError('UNAUTHORIZED', 'Teacher only');
}

async function updateRoom(
	ctx: LiveContext<User>,
	room: Room,
	changes: Partial<Omit<Room, 'id' | 'quiz'>>
) {
	Object.assign(room, changes);
	await db.update(roomTable).set(changes).where(eq(roomTable.id, room.id));
	ctx.publish(TOPICS.room(room.id), 'set', room);
	ctx.publish(TOPICS.rooms, 'updated', room);
}

export const nextQuestion = live(async (ctx: LiveContext<User>, roomId: string) => {
	requireTeacher(ctx);

	try {
		const room = await getRoomById(roomId);
		if (!room) {
			throw new LiveError('NOT_FOUND', 'Room not found');
		}

		const nextIndex = room.current_question ? room.current_question.position + 1 : 0;

		const quizQuestions = await db.query.quizTable.findFirst({
			where: (quiz, { eq }) => eq(quiz.id, room.quiz.id),
			columns: {
				questions: true
			}
		});

		if (!quizQuestions) {
			throw new LiveError('NOT_FOUND', 'Quiz questions not found');
		}

		const parsedQuestions = liveQuestionSchema.array().parse(quizQuestions.questions);
		const nextQuestion = parsedQuestions[nextIndex];

		if (!nextQuestion) {
			await updateRoom(ctx, room, {
				state: RoomState.Finished,
				current_answers: null,
				question_ends_at: null,
				paused_remaining: null
			});
			return;
		}

		await updateRoom(ctx, room, {
			state: RoomState.Question,
			current_question: nextQuestion,
			current_answers: null,
			question_ends_at: nextQuestion.timelimit
				? Date.now() + nextQuestion.timelimit * 1000
				: null,
			paused_remaining: null
		});
	} catch (error) {
		console.error('Fehler beim Starten des Raums:', error);
		throw new LiveError('DB', 'Error occurred while starting room');
	}
});

export const pauseTimer = live(async (ctx: LiveContext<User>, roomId: string) => {
	requireTeacher(ctx);

	const room = await getRoomById(roomId);
	if (room?.state !== RoomState.Question) throw new LiveError('NOT_FOUND', 'No running question');
	if (room.paused_remaining != null) throw new LiveError('NOT_FOUND', 'Already paused');

	await updateRoom(ctx, room, {
		// -1 = pausiert ohne Timelimit
		paused_remaining: room.question_ends_at
			? Math.max(0, room.question_ends_at - Date.now())
			: -1,
		question_ends_at: null
	});
});

export const resumeTimer = live(async (ctx: LiveContext<User>, roomId: string) => {
	requireTeacher(ctx);

	const room = await getRoomById(roomId);
	if (room?.paused_remaining == null) throw new LiveError('NOT_FOUND', 'Timer is not paused');

	await updateRoom(ctx, room, {
		question_ends_at: room.paused_remaining >= 0 ? Date.now() + room.paused_remaining : null,
		paused_remaining: null
	});
});

export const showResults = live(async (ctx: LiveContext<User>, roomId: string) => {
	requireTeacher(ctx);

	const room = await getRoomById(roomId);
	if (!room?.current_question) throw new LiveError('NOT_FOUND', 'No active question');

	const quizQuestions = await db.query.quizTable.findFirst({
		where: (quiz, { eq }) => eq(quiz.id, room.quiz.id),
		columns: { questions: true }
	});
	const question = questionsSchema
		.parse(quizQuestions?.questions)
		.find((q) => q.id === room.current_question!.id);
	if (!question) throw new LiveError('NOT_FOUND', 'Question not found');

	await updateRoom(ctx, room, {
		state: RoomState.Answer,
		current_answers: question.correct,
		question_ends_at: null,
		paused_remaining: null
	});
});

export const submitAnswer = live(
	async (ctx: LiveContext<User>, roomId: string, selected: string[]) => {
		if (ctx.user?.type !== 'student') throw new LiveError('UNAUTHORIZED', 'Student only');

		const parsed = answerSubmitSchema.safeParse(selected);
		if (!parsed.success) throw new LiveError('VALIDATION', 'Invalid answer selection');

		const room = await getRoomById(roomId);
		if (!room?.current_question) throw new LiveError('NOT_FOUND', 'No active question');
		if (room.state !== RoomState.Question) throw new LiveError('CLOSED', 'Question is closed');
		if (room.paused_remaining != null) throw new LiveError('PAUSED', 'Quiz is paused');
		// 1s Kulanz für Netzwerklatenz beim Zeitablauf
		if (room.question_ends_at != null && Date.now() > room.question_ends_at + 1000) {
			throw new LiveError('TIME_UP', 'Time is up');
		}

		const [answer] = await db
			.insert(answerTable)
			.values({
				room_id: roomId,
				quiz_id: room.quiz.id,
				question_id: room.current_question.id,
				student_id: ctx.user.id,
				student_name: ctx.user.name,
				selected: parsed.data
			})
			.onConflictDoUpdate({
				target: [answerTable.room_id, answerTable.question_id, answerTable.student_id],
				set: {
					selected: parsed.data,
					student_name: ctx.user.name,
					answered_at: new Date().toISOString()
				}
			})
			.returning();

		ctx.publish(TOPICS.roomAnswers(roomId), 'created', answerSelectSchema.parse(answer));
	}
);

export const roomAnswers = live.stream(
	(_ctx, roomId: string) => TOPICS.roomAnswers(roomId),
	async (_ctx, roomId: string) => {
		const answers = await db.query.answerTable.findMany({
			where: (answer, { eq }) => eq(answer.room_id, roomId)
		});
		return answerSelectSchema.array().parse(answers);
	},
	{
		merge: 'crud',
		key: 'id',
		access: (ctx: LiveContext<User>) => ctx.user?.type === 'teacher'
	}
);

export const room = live.room({
	topic: (_, roomId: string) => TOPICS.room(roomId),
	merge: 'set',
	guard: async (ctx: LiveContext<User>, roomId: string) => {
		if (ctx.user?.type !== 'student') return;

		const topic = TOPICS.room(roomId);
		if (hasStudent(topic, ctx.user.id)) return;

		const room = await getRoomById(roomId);
		if (room?.limit && studentCount(topic) >= room.limit) {
			throw new LiveError('ROOM_FULL', 'Room has reached its student limit');
		}
	},
	onJoin: (ctx: LiveContext<User>, roomId: string) => {
		if (ctx.user?.type === 'student') addStudent(TOPICS.room(roomId), ctx.user.id);
	},
	onLeave: (ctx: LiveContext<User>, topic: string) => {
		if (ctx.user?.type === 'student') removeStudent(topic, ctx.user.id);
	},
	init: async (_, roomId: string) => {
		const room = await getRoomById(roomId);
		return room ?? { state: 'ended' };
	},
	presence: (ctx: LiveContext<User>): PresenceUser => ({
		name: ctx.user.name,
		type: ctx.user.type
	})
});
