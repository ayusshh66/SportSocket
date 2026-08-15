import express, { Request, Response } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/index.js";
import { matches } from "../db/schema.js";
import { db } from "../db/index.js";
import { getMatchStatus } from "../utils/index.js";

const matchRouter = express.Router();
const MAX_LIMIT = 100; // Maximum limit for pagination

matchRouter.get("/", async(req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 10, MAX_LIMIT);

    try{
        const parsed = await listMatchesQuerySchema.safeParseAsync(req.query);
        
        if(!parsed.success) {
            return res.status(400).json({ error:"Invalid query parameters", detail: parsed.error.issues });
        }

        const limit = Math.min(parsed.data.limit || 50, MAX_LIMIT);

        const matchesList = await db.query.matches.findMany({
            limit: limit,
            orderBy: {createdAt: "desc"},
        });

        return res.status(200).json({ data: matchesList });


    }catch(err) {
        return res.status(500).json({ error: "Internal server error", detail: JSON.stringify(err) })
    }
    
});

matchRouter.post("/", async (req: Request, res: Response) => {
  const parsed = await createMatchSchema.safeParseAsync(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const calculatedStatus = (getMatchStatus(startTime, endTime) ?? "scheduled") as "scheduled" | "live" | "finished";

    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: calculatedStatus,
      })
      .returning();

      if(res.app.locals.broadcastMatchCreated) {
        res.app.locals.broadcastMatchCreated(event);
      }

    return res.status(201).json({ message: "Match created successfully", data: event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      error: "Internal server error", 
      detail: err instanceof Error ? err.message : String(err) 
    });
  }
});

export default matchRouter;