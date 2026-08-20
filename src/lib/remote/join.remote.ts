import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { answerTable } from '$lib/server/db/schema';
import { checkRoomCode } from '$lib/server/occupancy';
import { invalid, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import z from 'zod';

const roomCodeSchema = z.object({
	roomId: z.string().length(6, 'Der Raumcode muss genau 6 Zeichen lang sein')
});

export const roomCodeForm = form(roomCodeSchema, async ({ roomId }) => {
	const event = getRequestEvent();
	return checkRoomCode(roomId, event.cookies);
});

const roomNameSchema = z.object({
	name: z.string().trim().min(1, 'Der Name darf nicht leer sein'),
	identifier: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, 'Die Kennung darf nicht leer sein')
		.max(255, 'Die Kennung ist zu lang'),
	roomId: z.string().length(6, 'Der Raumcode muss genau 6 Zeichen lang sein')
});

const ONE_YEAR = 60 * 60 * 24 * 365;

export const roomNameForm = form(roomNameSchema, async ({ name, identifier, roomId }, issue) => {
	const existing = await db.query.answerTable.findFirst({
		where: eq(answerTable.student_id, identifier),
		columns: { student_name: true }
	});

	if (existing && existing.student_name !== name) {
		invalid(issue.identifier('Diese Kennung wird bereits für einem anderen Namen verwendet'));
	}

	const event = getRequestEvent();
	event.cookies.set('name', name, { path: '/', maxAge: ONE_YEAR });
	event.cookies.set('id', identifier, { path: '/', maxAge: ONE_YEAR });
	redirect(303, `/student/r/${roomId}`);
});
