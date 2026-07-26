import { revealAnswer } from '$lib/components/quiz/quiz.utils';
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
import { answerTable, quizTable, roomTable } from '$lib/server/db/schema';
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
		},
		where: (room, { isNull }) => isNull(room.deleted_at)
	});
	return roomSelectSchema.array().parse(rooms);
}

export async function getRoomByCode(code: string): Promise<Room | undefined> {
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
		where: (room, { eq, and, isNull }) => and(eq(room.code, code), isNull(room.deleted_at))
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
		requireTeacher(ctx);
		try {
			const [{ code }] = await db
				.insert(roomTable)
				.values({ ...roomInsert, teacher_id: ctx.user!.id })
				.returning({ code: roomTable.code });

			const room = await getRoomByCode(code);
			if (!room) {
				throw new LiveError('NOT_FOUND', 'Room not found');
			}

			await db
				.update(quizTable)
				.set({ last_run: room.created_at })
				.where(eq(quizTable.id, room.quiz.id))
				.returning();

			ctx.publish(TOPICS.rooms, 'created', room);
			return true;
		} catch (error) {
			console.error('Fehler beim Einfügen des Raums:', error);
			throw new LiveError('DB', 'Error occurred while inserting room');
		}
	}
);

export const deleteRoom = live(async (ctx: LiveContext<User>, code: string) => {
	if (!ctx.user) throw new LiveError('UNAUTHORIZED', 'User not authenticated');
	try {
		const room = await getRoomByCode(code);
		if (!room) {
			throw new LiveError('NOT_FOUND', 'Room not found');
		}
		requireRoomOwner(ctx, room);
		room.state = RoomState.Finished;

		await db
			.update(roomTable)
			.set({ deleted_at: new Date().toISOString() })
			.where(eq(roomTable.id, room.id));
		ctx.publish(TOPICS.rooms, 'deleted', { id: room.id });
		ctx.publish(TOPICS.room(code), 'set', room);

		return true;
	} catch (error) {
		if (error instanceof LiveError) throw error;
		console.error('Fehler beim Löschen des Raums:', error);
		throw new LiveError('DB', 'Error occurred while deleting room');
	}
});

function requireTeacher(ctx: LiveContext<User>) {
	if (ctx.user?.type !== 'teacher') throw new LiveError('UNAUTHORIZED', 'Teacher only');
}

function requireRoomOwner(ctx: LiveContext<User>, room: Room) {
	requireTeacher(ctx);
	if (ctx.user.id !== room.teacherId) {
		throw new LiveError('UNAUTHORIZED', 'Room owner only');
	}
}

async function updateRoom(
	ctx: LiveContext<User>,
	room: Room,
	changes: Partial<Omit<Room, 'id' | 'quiz'>>
) {
	Object.assign(room, changes);
	await db.update(roomTable).set(changes).where(eq(roomTable.id, room.id));
	ctx.publish(TOPICS.room(room.code), 'set', room);
	ctx.publish(TOPICS.rooms, 'updated', room);
}

export const nextQuestion = live(async (ctx: LiveContext<User>, code: string) => {
	requireTeacher(ctx);

	try {
		const room = await getRoomByCode(code);
		if (!room) {
			throw new LiveError('NOT_FOUND', 'Room not found');
		}
		requireRoomOwner(ctx, room);

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
			question_ends_at: nextQuestion.timelimit ? Date.now() + nextQuestion.timelimit * 1000 : null,
			paused_remaining: null
		});
	} catch (error) {
		if (error instanceof LiveError) throw error;
		console.error('Fehler beim Starten des Raums:', error);
		throw new LiveError('DB', 'Error occurred while starting room');
	}
});

export const pauseTimer = live(async (ctx: LiveContext<User>, code: string) => {
	const room = await getRoomByCode(code);
	if (!room) throw new LiveError('NOT_FOUND', 'Room not found');
	requireRoomOwner(ctx, room);
	if (room.state !== RoomState.Question) throw new LiveError('NOT_FOUND', 'No running question');
	if (room.paused_remaining != null) throw new LiveError('NOT_FOUND', 'Already paused');

	await updateRoom(ctx, room, {
		// -1 = pausiert ohne Timelimit
		paused_remaining: room.question_ends_at ? Math.max(0, room.question_ends_at - Date.now()) : -1,
		question_ends_at: null
	});
});

export const resumeTimer = live(async (ctx: LiveContext<User>, code: string) => {
	const room = await getRoomByCode(code);
	if (!room) throw new LiveError('NOT_FOUND', 'Room not found');
	requireRoomOwner(ctx, room);
	if (room.paused_remaining == null) throw new LiveError('NOT_FOUND', 'Timer is not paused');

	await updateRoom(ctx, room, {
		question_ends_at: room.paused_remaining >= 0 ? Date.now() + room.paused_remaining : null,
		paused_remaining: null
	});
});

export const showResults = live(async (ctx: LiveContext<User>, code: string) => {
	const room = await getRoomByCode(code);
	if (!room) throw new LiveError('NOT_FOUND', 'Room not found');
	requireRoomOwner(ctx, room);
	if (!room.current_question) throw new LiveError('NOT_FOUND', 'No active question');

	const quizQuestions = await db.query.quizTable.findFirst({
		where: (quiz, { eq }) => eq(quiz.id, room.quiz.id),
		columns: { questions: true }
	});
	const question = questionsSchema
		.parse(quizQuestions?.questions)
		.find((q) => q.id === room.current_question!.id);
	if (!question) throw new LiveError('NOT_FOUND', 'Question not found');

	const update: Partial<Omit<Room, 'id' | 'quiz'>> = {
		state: RoomState.Answer,
		question_ends_at: null,
		paused_remaining: null,
		...revealAnswer(question)
	};

	await updateRoom(ctx, room, update);
});

export const submitAnswer = live(
	async (ctx: LiveContext<User>, code: string, selected: string[]) => {
		if (ctx.user?.type !== 'student') throw new LiveError('UNAUTHORIZED', 'Student only');

		const parsed = answerSubmitSchema.safeParse(selected);
		if (!parsed.success) throw new LiveError('VALIDATION', 'Invalid answer selection');

		const room = await getRoomByCode(code);
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
				room_id: room.id,
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
					student_name: ctx.user.name
				}
			})
			.returning();

		ctx.publish(TOPICS.roomAnswers(code), 'created', answerSelectSchema.parse(answer));
	}
);

export const roomAnswers = live.stream(
	(_ctx, code: string) => TOPICS.roomAnswers(code),
	async (_ctx, code: string) => {
		const room = await getRoomByCode(code);
		if (!room) throw new LiveError('NOT_FOUND', 'Room not found');

		const answers = await db.query.answerTable.findMany({
			where: (answer, { eq }) => eq(answer.room_id, room.id)
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
	topic: (_, code: string) => TOPICS.room(code),
	merge: 'set',
	guard: async (ctx: LiveContext<User>, code: string) => {
		if (ctx.user?.type !== 'student') return;

		const topic = TOPICS.room(code);
		if (hasStudent(topic, ctx.user.id)) return;

		const room = await getRoomByCode(code);
		if (room?.limit && studentCount(topic) >= room.limit) {
			throw new LiveError('ROOM_FULL', 'Room has reached its student limit');
		}
	},
	onJoin: (ctx: LiveContext<User>, code: string) => {
		if (ctx.user?.type === 'student') addStudent(TOPICS.room(code), ctx.user.id);
	},
	onLeave: (ctx: LiveContext<User>, topic: string) => {
		if (ctx.user?.type === 'student') removeStudent(topic, ctx.user.id);
	},
	init: async (_, code: string) => {
		const room = await getRoomByCode(code);
		return room ?? { state: 'ended' };
	},
	presence: (ctx: LiveContext<User>): PresenceUser => ({
		name: ctx.user.name,
		type: ctx.user.type
	})
});
