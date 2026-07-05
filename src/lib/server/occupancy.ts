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
