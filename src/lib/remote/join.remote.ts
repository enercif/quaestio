import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
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
		return { success: false };
	}

	const name = event.cookies.get('name');

	return { success: true, name };
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
