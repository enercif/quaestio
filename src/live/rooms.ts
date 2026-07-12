import { liveQuestionSchema } from '$lib/schemas/question.schema';
import {
	roomInsertSchema,
	roomSelectSchema,
	RoomState,
	type Room,
	type RoomInsert
} from '$lib/schemas/room.schema';
import { db } from '$lib/server/db';
import { roomTable } from '$lib/server/db/schema';
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

export const nextQuestion = live(async (ctx: LiveContext<User>, roomId: string) => {
	if (!ctx.user) throw new LiveError('UNAUTHORIZED', 'User not authenticated');

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

		room.state = RoomState.Question;
		room.current_question = nextQuestion;

		await db
			.update(roomTable)
			.set({ state: RoomState.Question, current_question: nextQuestion })
			.where(eq(roomTable.id, roomId))
			.returning();

		ctx.publish(TOPICS.room(roomId), 'set', room);
		ctx.publish(TOPICS.rooms, 'updated', room);
	} catch (error) {
		console.error('Fehler beim Starten des Raums:', error);
		throw new LiveError('DB', 'Error occurred while starting room');
	}
});

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
