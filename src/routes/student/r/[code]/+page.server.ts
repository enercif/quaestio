import { resolve } from '$app/paths';
import { studentCount } from '$lib/server/occupancy';
import { TOPICS } from '$lib/server/topics';
import { redirect } from '@sveltejs/kit';
import { getRoomByCode } from '../../../../live/rooms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const topic = TOPICS.room(params.code);
	const id = cookies.get('id');
	const name = cookies.get('name');

	const room = await getRoomByCode(params.code);

	if (!room || !id || !name) {
		redirect(303, resolve('/'));
	}

	if (room.limit && studentCount(topic) >= room.limit) {
		redirect(303, resolve('/'));
	}

	return {
		code: params.code,
		name,
		id
	};
};
