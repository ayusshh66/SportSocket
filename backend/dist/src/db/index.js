import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { relations } from "./relations.js";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in the environment variables.");
}
export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({
    client: sql,
    relations,
});
