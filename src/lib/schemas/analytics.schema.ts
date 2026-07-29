import z from 'zod';
import {
	choiceQuestionAnswerBaseSchema,
	partialPointsSchema,
	questionBaseSchema,
	scoringModeEnum,
	sequenceTypeEnum
} from './question.schema';
import { roomSelectSchema } from './room.schema';

const analyticsBaseQuestionSchema = questionBaseSchema.pick({
	id: true,
	points: true,
	question: true,
	position: true
});

const analyticsMultipleChoiceQuestionSchema = analyticsBaseQuestionSchema.extend({
	type: z.literal('multiple'),
	scoring: scoringModeEnum,
	correct: z.record(z.string(), z.string()),
	answers: z.array(choiceQuestionAnswerBaseSchema),
	partial_points: partialPointsSchema,
	sequence_type: sequenceTypeEnum
});

const analyticsSingleChoiceQuestionSchema = analyticsBaseQuestionSchema.extend({
	type: z.literal('single'),
	correct: z.record(z.string(), z.string()),
	answers: z.array(choiceQuestionAnswerBaseSchema),
	sequence_type: sequenceTypeEnum
});

const analyticsOpenTextQuestionSchema = analyticsBaseQuestionSchema.extend({
	type: z.literal('open'),
	correct: z.array(z.string())
});

const analyticsProgrammingQuestionSchema = analyticsBaseQuestionSchema.extend({
	type: z.literal('programming'),
	code: z.string(),
	language: z.string(),
	scoring: scoringModeEnum,
	partial_points: partialPointsSchema,
	correct: z.array(z.string())
});

export const analyticsQuestionSchema = z.discriminatedUnion('type', [
	analyticsMultipleChoiceQuestionSchema,
	analyticsSingleChoiceQuestionSchema,
	analyticsOpenTextQuestionSchema,
	analyticsProgrammingQuestionSchema
]);

export const analyticsQuizSchema = z.object({
	title: z.string(),
	questions: z.array(analyticsQuestionSchema)
});

export const analyticsAnswerSchema = z.object({
	id: z.string(),
	question_id: z.string(),
	student_id: z.string(),
	student_name: z.string(),
	selected: z.array(z.string()),
	points_override: z.number().nullish()
});

export const analyticsRoomSchema = z.object({
	room: roomSelectSchema.pick({
		code: true,
		created_at: true
	}),
	quiz: analyticsQuizSchema,
	answers: z.array(analyticsAnswerSchema)
});

export const analyticsStudentAnswerSchema = analyticsAnswerSchema.omit({
	student_id: true,
	student_name: true
});

export const analyticsStudentSchema = z.object({
	id: z.string(),
	name: z.string(),
	rooms: z.array(
		roomSelectSchema.pick({ code: true, created_at: true, id: true }).extend({
			quiz: analyticsQuizSchema,
			answers: z.array(analyticsStudentAnswerSchema)
		})
	)
});

export type AnalyticsRoom = z.infer<typeof analyticsRoomSchema>;
export type AnalyticsStudent = z.infer<typeof analyticsStudentSchema>;
export type AnalyticsQuiz = z.infer<typeof analyticsQuizSchema>;
export type AnalyticsQuizQuestion = z.infer<typeof analyticsQuestionSchema>;
