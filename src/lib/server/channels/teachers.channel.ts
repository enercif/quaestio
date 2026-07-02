export function teacherChannel(roomId?: string) {
	return roomId ? `teacher:${roomId}` : 'teachers';
}

export const teachersByRoom = new Map<
	string,
	Map<string, { name: string; connections: Set<symbol> }>
>();
