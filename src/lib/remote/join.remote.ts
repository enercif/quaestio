import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { hasStudent, studentCount } from '$lib/server/occupancy';
import { TOPICS } from '$lib/server/topics';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import z from 'zod';

const roomCodeSchema = z.object({
	roomId: z.string().length(6, 'Der Raumcode muss genau 6 Zeichen lang sein')
});

export const roomCodeForm = form(roomCodeSchema, async ({ roomId }) => {
	const event = getRequestEvent();

	const room = await db.query.roomTable.findFirst({
		where: (room) => eq(room.id, roomId.toUpperCase())
	});

	if (!room) {
		return { success: false, reason: 'not_found' } as const;
	}

	const topic = TOPICS.room(room.id);
	const userId = event.cookies.get('id');
	const alreadyJoined = !!userId && hasStudent(topic, userId);
	if (room.limit && !alreadyJoined && studentCount(topic) >= room.limit) {
		return { success: false, reason: 'full' } as const;
	}

	const name = event.cookies.get('name');

	return { success: true, name } as const;
});

const roomNameSchema = z.object({
	name: z.string().min(1, 'Der Name darf nicht leer sein'),
	roomId: z.string().length(6, 'Der Raumcode muss genau 6 Zeichen lang sein')
});

export const roomNameForm = form(roomNameSchema, async ({ name, roomId }) => {
	const event = getRequestEvent();
	event.cookies.set('name', name, { path: '/' });
	redirect(303, `/student/r/${roomId}`);
});
