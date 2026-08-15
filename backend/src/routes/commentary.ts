import { Router, Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { matchIdParamSchema } from "../validation/index.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/comentary.js";
import { db } from "../db/index.js";
import { commentary } from "../db/schema.js";

const MAX_LIMIT = 100;

// Router with mergeParams: true allows access to parent params (e.g., :id)
export const commentaryRouter = Router({ mergeParams: true });
export const commentartRouter = commentaryRouter; // alias for compatibility

commentaryRouter.get("/", async (req: Request, res: Response) => {
    try {
        // 1. Validate route params (:id) & query (?limit=...)
        const paramsParsed = await matchIdParamSchema.safeParseAsync(req.params);
        if (!paramsParsed.success) {
            return res.status(400).json({
                error: "Invalid match ID",
                detail: paramsParsed.error.issues,
            });
        }

        const queryParsed = await listCommentaryQuerySchema.safeParseAsync(req.query);
        if (!queryParsed.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                detail: queryParsed.error.issues,
            });
        }

        const matchId = paramsParsed.data.id;
        // 4. Default to 100 with MAX_LIMIT 
        const limit = Math.min(queryParsed.data.limit ?? 100, MAX_LIMIT);

        const commentaryList = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        return res.status(200).json({ data: commentaryList });
    } catch (error) {
        console.error("Error fetching commentary:", error);
        return res.status(500).json({
            error: "Internal server error",
            detail: error instanceof Error ? error.message : String(error),
        });
    }
});

commentaryRouter.post("/", async (req: Request, res: Response) => {
    try {
        const paramsParsed = await matchIdParamSchema.safeParseAsync(req.params);
        if (!paramsParsed.success) {
            return res.status(400).json({
                error: "Invalid match ID parameter",
                detail: paramsParsed.error.issues,
            });
        }

        const bodyParsed = await createCommentarySchema.safeParseAsync(req.body);
        if (!bodyParsed.success) {
            return res.status(400).json({
                error: "Invalid request payload",
                detail: bodyParsed.error.issues,
            });
        }

        const matchId = paramsParsed.data.id;

        const [newCommentary] = await db
            .insert(commentary)
            .values({
                matchId,
                ...bodyParsed.data,
            })
            .returning();

        return res.status(201).json({
            message: "Commentary created successfully",
            data: newCommentary,
        });
    } catch (error) {
        console.error("Error creating commentary:", error);
        return res.status(500).json({
            error: "Internal server error",
            detail: error instanceof Error ? error.message : String(error),
        });
    }
});

export default commentaryRouter;
