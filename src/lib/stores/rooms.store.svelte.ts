type Room = {
	id: string;
	limit?: number;
};

export const roomsStore = $state<Room[]>([]);
