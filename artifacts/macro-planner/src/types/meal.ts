export const MealMealType = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snack",
  pre_workout: "pre_workout",
  post_workout: "post_workout",
} as const;

export type MealMealType = typeof MealMealType[keyof typeof MealMealType];