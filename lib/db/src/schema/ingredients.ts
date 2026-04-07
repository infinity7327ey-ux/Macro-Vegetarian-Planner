import { pgTable, text, serial, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ingredientsTable = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  proteinPer100g: real("protein_per_100g").notNull(),
  carbsPer100g: real("carbs_per_100g").notNull(),
  fatsPer100g: real("fats_per_100g").notNull(),
  caloriesPer100g: real("calories_per_100g").notNull(),
  isVegetarian: boolean("is_vegetarian").notNull().default(true),
  isVegan: boolean("is_vegan").notNull().default(false),
});

export const insertIngredientSchema = createInsertSchema(ingredientsTable).omit({ id: true });
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredientsTable.$inferSelect;
