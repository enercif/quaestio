import { findAllRooms } from '$lib/remote/room.remote';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const rooms = await findAllRooms();
	return {
		rooms
	};
};
