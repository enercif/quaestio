import z from 'zod';
import { baseQuestionShape } from './shared.question.schema';

const type = 'programming';
const programmingQuestionShape = baseQuestionShape.omit({ correct: true }).extend({
	type: z.literal(type),
	code_snippet: z.string().min(1, 'Der Code darf nicht leer sein.'),
	language: z.string().min(1, 'Die Sprache darf nicht leer sein.'),
	correct_lines: z
		.array(z.number())
		.min(1, 'Es muss mindestens eine Zeile als Lösung markiert sein.'),
	reasons: z.record(z.coerce.number(), z.string()),
	hint: z.string().optional()
});

export const programmingQuestionSchema = programmingQuestionShape.refine(
	(question) => question.correct_lines.every((line) => question.reasons[line]?.trim()),
	{
		message: 'Für jede markierte Fehler-Zeile muss eine Begründung angegeben werden.',
		path: ['reasons']
	}
);

export const liveProgrammingQuestionSchema = programmingQuestionShape.omit({
	correct_lines: true,
	reasons: true
});

export type ProgrammingQuestionType = typeof type;
export type ProgrammingQuestion = z.infer<typeof programmingQuestionSchema>;
export type LiveProgrammingQuestion = z.infer<typeof liveProgrammingQuestionSchema>;
