import {
  pgTable,
  varchar,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Workspace } from "@/lib/studio";

// Each anonymous demo is isolated by a high-entropy, HttpOnly session cookie.
export const demoWorkspaces = pgTable("ms_demo_workspaces", {
  key: varchar("key", { length: 64 }).primaryKey(),
  data: jsonb("data").$type<Workspace>().notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
