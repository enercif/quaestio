import {
	roomInsertSchema,
	roomSelectSchema,
	type Room,
	type RoomInsert
} from '$lib/schemas/room.schema';
import { db } from '$lib/server/db';
import { roomTable } from '$lib/server/db/schema';
import { TOPICS } from '$lib/server/topics';
import type { PresenceUser } from '$lib/types/presence.type';
import type { User } from '$lib/types/user.type';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { live, LiveError, type LiveContext } from 'svelte-realtime';

async function getRooms(): Promise<Room[]> {
	const rooms = await db.query.roomTable.findMany({
		with: {
			quiz: {
				columns: {
					title: true
				}
			}
		}
	});
	return roomSelectSchema.array().parse(rooms);
}

async function getRoomById(roomId: string): Promise<Room | undefined> {
	const room = await db.query.roomTable.findFirst({
		with: {
			quiz: {
				columns: {
					title: true
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
		room.state = 'ended';

		await db.delete(roomTable).where(eq(roomTable.id, roomId)).returning();
		ctx.publish(TOPICS.rooms, 'deleted', { id: roomId });
		ctx.publish(TOPICS.room(roomId), 'set', room);

		return true;
	} catch (error) {
		console.error('Fehler beim Löschen des Raums:', error);
		throw new LiveError('DB', 'Error occurred while deleting room');
	}
});

export const startRoom = live(async (ctx: LiveContext<User>, roomId: string) => {
	if (!ctx.user) throw new LiveError('UNAUTHORIZED', 'User not authenticated');

	try {
		const room = await getRoomById(roomId);
		if (!room) {
			throw new LiveError('NOT_FOUND', 'Room not found');
		}
		room.state = 'started';

		await db
			.update(roomTable)
			.set({ state: 'started' })
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
	init: async (_, roomId: string) => {
		const room = await getRoomById(roomId);
		return room ?? { state: 'ended' };
	},
	presence: (ctx: LiveContext<User>): PresenceUser => ({
		name: ctx.user.name,
		type: ctx.user.type
	})
});
