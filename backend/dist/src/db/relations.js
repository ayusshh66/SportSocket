import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";
export const relations = defineRelations(schema, (r) => ({
    matches: {
        commentary: r.many.commentary(),
    },
    commentary: {
        match: r.one.matches({
            from: r.commentary.matchId,
            to: r.matches.id,
        }),
    },
}));
