import { command, getRequestEvent, query } from '$app/server';
import { roomInsertSchema, roomSelectSchema } from '$lib/schemas/room.schema';
import { teacherChannel, teachersByRoom } from '$lib/server/channels/teachers.channel';
import { notify, once } from '$lib/server/channels/utils';
import { db } from '$lib/server/db';
import { roomTable } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';
import z from 'zod';

const HEARTBEAT_MS = 10_000;

function teachersFor(roomId: string): Record<string, string> {
	const teachers = teachersByRoom.get(roomId);
	if (!teachers) return {};
	return Object.fromEntries([...teachers].map(([id, { name }]) => [id, name]));
}

function joinTeacher(roomId: string, userId: string, name: string) {
	let teachers = teachersByRoom.get(roomId);
	if (!teachers) teachersByRoom.set(roomId, (teachers = new Map()));

	let entry = teachers.get(userId);
	if (!entry) teachers.set(userId, (entry = { name, connections: new Set() }));
	entry.name = name;

	const connection = Symbol();
	entry.connections.add(connection);

	return function leave() {
		const teachers = teachersByRoom.get(roomId);
		const entry = teachers?.get(userId);
		if (!teachers || !entry || !entry.connections.delete(connection)) return;

		if (entry.connections.size > 0) return;
		teachers.delete(userId);
		if (teachers.size === 0) teachersByRoom.delete(roomId);
	};
}

export const selectRoomsCount = query.live(async function* () {
	while (true) {
		const [result] = await db.select({ count: count() }).from(roomTable);
		yield result.count;
		await once(teacherChannel());
	}
});

export const selectRooms = query.live(async function* () {
	while (true) {
		const rooms = await db.query.roomTable.findMany({
			with: {
				quiz: {
					columns: {
						title: true
					}
				}
			}
		});
		yield roomSelectSchema
			.array()
			.parse(rooms.map((room) => ({ ...room, teachers: teachersFor(room.id) })));
		await once(teacherChannel());
	}
});

export const selectRoomById = query.live(z.string(), async function* (id) {
	const { locals } = getRequestEvent();
	console.log(`Lehrer ${locals.id} (${locals.name}) tritt Raum ${id} bei`);
	const leave = joinTeacher(id, locals.id, locals.name);
	notify(teacherChannel(id), teacherChannel());
	try {
		while (true) {
			const room = await db.query.roomTable.findFirst({
				with: {
					quiz: {
						columns: {
							title: true
						}
					}
				},
				where: (room, { eq }) => eq(room.id, id)
			});

			if (!room) error(404, 'Room not found');
			yield roomSelectSchema.parse({ ...room, teachers: teachersFor(id) });
			await once(teacherChannel(id), HEARTBEAT_MS);
		}
	} finally {
		leave();
		notify(teacherChannel(id), teacherChannel());
	}
});

export const insertRoom = command(roomInsertSchema, async (room) => {
	try {
		await db.insert(roomTable).values(room).returning();
		notify(teacherChannel());
		return true;
	} catch (error) {
		console.error('Fehler beim Einfügen des Raums:', error);
		return false;
	}
});

export const deleteRoomById = command(z.string(), async (id) => {
	try {
		await db.delete(roomTable).where(eq(roomTable.id, id)).returning();
		notify(teacherChannel(), teacherChannel(id));
		return true;
	} catch (error) {
		console.error('Fehler beim Löschen des Raums:', error);
		return false;
	}
});

export const leaveRoomTeacher = command(z.string(), async (roomId) => {
	const { locals } = getRequestEvent();

	const teachers = teachersByRoom.get(roomId);
	if (!teachers?.delete(locals.id)) return;
	if (teachers.size === 0) teachersByRoom.delete(roomId);

	notify(teacherChannel(roomId), teacherChannel());
});
