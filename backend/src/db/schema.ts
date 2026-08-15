import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", ["scheduled", "live", "finished"]);

// match table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sports: text("sports").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  status : matchStatusEnum("status").notNull().default("scheduled"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  homeScore : integer("home_score").notNull().default(0),
  awayScore : integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

//commentary table
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  minute : integer("minute"),
  sequence : integer("sequence"),
  period : text("period"),
  eventType: text("event_type"),
  actor : text("actor"),
  team: text("team"),
  message: text("message"),
  metadata: jsonb("metadata"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

