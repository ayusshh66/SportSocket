import {z} from "zod";

export const MATCH_STATUS = {
    SCEHDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished"
};

export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().max(100).optional(),
});

export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const isoDateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
    message : "Invalid ISO date string",
});

const createMatchSchema = z.object({
    sport: z.string().min(1, "Sports is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    startTime: isoDateString,
    endTime: isoDateString,
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional().superRefine((val, ctx) => {
        if (val !== undefined && val < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Away score must be a non-negative integer",
            });
        }   
    }),
    status: z.enum([MATCH_STATUS.SCEHDULED, MATCH_STATUS.LIVE, MATCH_STATUS.FINISHED]).optional(),
});
