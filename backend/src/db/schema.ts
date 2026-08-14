import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", ["scheduled", "live", "finished"]);

export const matches = pgTable("matches", {
  id: integer("id").primaryKey(),
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

export const cometary = pgTable("commentary", {
  id: integer("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  minute : integer("minute"),
  

})