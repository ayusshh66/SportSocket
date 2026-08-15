import express, { Request, Response } from "express";
import { createMatchSchema } from "../validation/index.js";
import { matches } from "../db/schema.js";
import { db } from "../db/index.js";
import { getMatchStatus } from "../utils/index.js";

const matchRouter = express.Router();

matchRouter.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the API!");
});

matchRouter.post("/matches", async (req: Request, res: Response) => {
  const parsed = await createMatchSchema.safeParseAsync(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
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