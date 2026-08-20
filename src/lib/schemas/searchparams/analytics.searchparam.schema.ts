import z from 'zod';

export const analyticsSearchParamsSchema = z.object({
	tab: z.enum(['overview', 'questions', 'students']).default('overview')
});
