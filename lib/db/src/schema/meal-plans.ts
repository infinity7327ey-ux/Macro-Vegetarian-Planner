import { pgTable, serial, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const mealPlansTable = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull().default(1),
  days: jsonb("days").notNull().default([]),
  targetProteinG: real("target_protein_g").notNull(),
  targetCaloriesKcal: real("target_calories_kcal").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMealPlanSchema = createInsertSchema(mealPlansTable).omit({ id: true, createdAt: true });
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlansTable.$inferSelect;
