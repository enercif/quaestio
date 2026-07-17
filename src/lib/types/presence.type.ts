export type Presence = {
	key: string;
	data: PresenceUser;
};

export type PresenceUser = {
	name: string;
	type: 'student' | 'teacher';
};
