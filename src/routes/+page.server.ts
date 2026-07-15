import { checkRoomCode } from '$lib/server/occupancy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const roomId = url.searchParams.get('roomId');
	if (!roomId) return {};

	return {
		roomId: roomId.toUpperCase(),
		result: await checkRoomCode(roomId, cookies)
	};
};
