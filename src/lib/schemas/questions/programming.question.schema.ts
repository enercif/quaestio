import z from 'zod';
import { allOrNothingReasons, questionBaseSchema } from './shared.question.schema';

const type = 'programming';
const programmingQuestionBaseSchema = questionBaseSchema.extend({
	type: z.literal(type),
	code: z.string().min(1, 'Der Code darf nicht leer sein.'),
	language: z.string().min(1, 'Die Sprache darf nicht leer sein.'),
	correct: z.array(z.string()).min(1, 'Es muss mindestens eine Zeile als Lösung markiert sein.'),
	reasons: z.record(z.string(), z.string())
});

export const programmingQuestionSchema = programmingQuestionBaseSchema.refine(
	(question) => allOrNothingReasons(question.correct, question.reasons),
	{
		message: 'Begründungen müssen für jede korrekte Zeile angegeben werden oder für gar keine',
		path: ['reasons']
	}
);

export const liveProgrammingQuestionSchema = programmingQuestionBaseSchema.omit({
	correct: true,
	reasons: true
});

export type ProgrammingQuestionType = typeof type;
export type ProgrammingQuestion = z.infer<typeof programmingQuestionSchema>;
export type LiveProgrammingQuestion = z.infer<typeof liveProgrammingQuestionSchema>;
