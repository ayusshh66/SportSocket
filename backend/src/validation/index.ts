import {z} from "zod";

export const MATCH_STATUS = {
    SCHEDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished"
};

export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().max(100).optional(),
});

export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});


export const createMatchSchema = z.object({
    sports: z.string().min(1, "Sports is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional()}).superRefine((data, ctx) => {
           const start = new Date(data.startTime);
           const end = new Date(data.endTime);
           if (start >= end) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Start time must be before end time",
                    path: ["endTime"],
                });
            }
    });

    export const updateScoreSchema = z.object({
        homeScore: z.coerce.number().int().nonnegative(),
        awayScore: z.coerce.number().int().nonnegative(),
    });
    
