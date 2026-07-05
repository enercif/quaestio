import { resolve } from '$app/paths';
import { studentCount } from '$lib/server/occupancy';
import { TOPICS } from '$lib/server/topics';
import { redirect } from '@sveltejs/kit';
import { getRoomById } from '../../../../live/rooms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const topic = TOPICS.room(params.id);
	const id = cookies.get('id');

	const room = await getRoomById(params.id);

	if (!room) {
		redirect(303, resolve('/'));
	}

	if (room.limit && studentCount(topic) >= room.limit) {
		redirect(303, resolve('/'));
	}

	return {
		roomId: params.id,
		name: cookies.get('name') ?? 'Unknown',
		id: id ?? 'Unknown'
	};
};
