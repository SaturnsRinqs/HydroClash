import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"),
  liquidColor: varchar("liquid_color").default("#06b6d4"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  drinks: many(drinks),
  challengeParticipations: many(challengeParticipants),
  createdChallenges: many(challenges),
}));

// Challenges table
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  targetMl: integer("target_ml").notNull(),
  durationHours: integer("duration_hours"), // null = no time limit
  type: varchar("type").notNull(), // 'daily' or 'total'
  status: varchar("status").notNull().default("active"), // 'active' or 'completed'
  inviteCode: varchar("invite_code").unique().notNull().default(sql`substring(md5(random()::text), 1, 8)`),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.creatorId],
    references: [users.id],
  }),
  participants: many(challengeParticipants),
  drinks: many(drinks),
}));

// Challenge participants (many-to-many relationship)
export const challengeParticipants = pgTable("challenge_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipants.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
}));

// Drinks log table
export const drinks = pgTable("drinks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").references(() => challenges.id),
  amountMl: integer("amount_ml").notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const drinksRelations = relations(drinks, ({ one }) => ({
  user: one(users, {
    fields: [drinks.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [drinks.challengeId],
    references: [challenges.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertChallenge = typeof challenges.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;

export type InsertChallengeParticipant = typeof challengeParticipants.$inferInsert;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;

export type InsertDrink = typeof drinks.$inferInsert;
export type Drink = typeof drinks.$inferSelect;

// Zod schemas for validation
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  creatorId: true,
});

export const insertDrinkSchema = createInsertSchema(drinks).omit({
  id: true,
  loggedAt: true,
  userId: true,
});

export const updateUserSettingsSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  liquidColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type InsertChallengeInput = z.infer<typeof insertChallengeSchema>;
export type InsertDrinkInput = z.infer<typeof insertDrinkSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
