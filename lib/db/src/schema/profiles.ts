import { pgTable, text, serial, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  weightKg: real("weight_kg").notNull(),
  heightCm: real("height_cm"),
  ageYears: integer("age_years"),
  goal: text("goal").notNull().default("muscle_gain"),
  activityLevel: text("activity_level").notNull().default("moderately_active"),
  dietaryRestrictions: text("dietary_restrictions").array().notNull().default([]),
  preferredProteins: text("preferred_proteins").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
