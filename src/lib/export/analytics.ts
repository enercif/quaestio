import { downloadCsv, sanitizeFilename } from './csv';

type RoomParticipantScore = {
	studentId: string;
	studentName: string;
	pointsEarned: number;
};

type StudentQuizScore = {
	quizName: string;
	date: string;
	pointsEarned: number;
	pointsPossible: number;
};

export function exportRoomAnalyticsAsCsv({
	quizTitle,
	createdAt,
	roomCode,
	students,
	maxPoints
}: {
	quizTitle: string;
	createdAt: string;
	roomCode: string;
	students: RoomParticipantScore[];
	maxPoints: number;
}) {
	downloadCsv(
		students.map((student) => ({
			Studentenname: student.studentName,
			'Studenten-ID': student.studentId,
			Raumcode: roomCode,
			'Erreichte Punkte': student.pointsEarned,
			'Maximale Punkte': maxPoints
		})),
		`${quizTitle}: ${formatExportDate(createdAt)}.csv`
	);
}

export function exportStudentAnalyticsAsCsv({
	studentName,
	studentId,
	rooms
}: {
	studentName: string;
	studentId: string;
	rooms: StudentQuizScore[];
}) {
	downloadCsv(
		rooms.map((room) => ({
			Quizname: room.quizName,
			Datum: formatExportDate(room.date),
			'Erreichte Punkte': room.pointsEarned,
			'Maximale Punkte': room.pointsPossible
		})),
		`${sanitizeFilename(`${studentName}-${studentId}`)}.csv`
	);
}

function formatExportDate(date: string) {
	return new Date(date).toLocaleString('de-DE', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
}
