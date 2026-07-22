import { db } from '$lib/server/db';
import { TOPICS } from '$lib/server/topics';
import type { Cookies } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';

const occupancy = new Map<string, Set<string>>();

export function addStudent(topic: string, userId: string): void {
	let students = occupancy.get(topic);
	if (!students) {
		students = new Set();
		occupancy.set(topic, students);
	}
	students.add(userId);
}

export function removeStudent(topic: string, userId: string): void {
	const students = occupancy.get(topic);
	if (!students) return;
	students.delete(userId);
	if (students.size === 0) occupancy.delete(topic);
}

export function hasStudent(topic: string, userId: string): boolean {
	return occupancy.get(topic)?.has(userId) ?? false;
}

export function studentCount(topic: string): number {
	return occupancy.get(topic)?.size ?? 0;
}

export async function checkRoomCode(
	code: string,
	cookies: Cookies
): Promise<{ success: true; name?: string } | { success: false; reason: 'not_found' | 'full' }> {
	const room = await db.query.roomTable.findFirst({
		where: (room) => and(eq(room.code, code.toUpperCase()), isNull(room.deleted_at))
	});

	if (!room) {
		return { success: false, reason: 'not_found' };
	}

	const topic = TOPICS.room(room.code);
	const userId = cookies.get('id');
	const alreadyJoined = !!userId && hasStudent(topic, userId);
	if (room.limit && !alreadyJoined && studentCount(topic) >= room.limit) {
		return { success: false, reason: 'full' };
	}

	return { success: true, name: cookies.get('name') };
}
