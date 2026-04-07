interface IngredientData {
  name: string;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  caloriesPer100g: number;
}

interface MealIngredientOut {
  name: string;
  quantityG: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  caloriesKcal: number;
}

interface MealOut {
  name: string;
  mealType: string;
  ingredients: MealIngredientOut[];
  proteinG: number;
  carbsG: number;
  fatsG: number;
  caloriesKcal: number;
  notes: string | null;
}

interface DayPlanOut {
  dayNumber: number;
  dayName: string;
  workoutType: string | null;
  meals: MealOut[];
  totalProteinG: number;
  totalCarbsG: number;
  totalFatsG: number;
  totalCaloriesKcal: number;
}

export interface MacroTargets {
  dailyCaloriesKcal: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatsG: number;
  proteinPerKg: number;
}

const INGREDIENTS_DB: Record<string, IngredientData> = {
  "Paneer": { name: "Paneer", proteinPer100g: 18.3, carbsPer100g: 1.2, fatsPer100g: 20.8, caloriesPer100g: 265 },
  "Soya Chunks (dry)": { name: "Soya Chunks (dry)", proteinPer100g: 52, carbsPer100g: 33, fatsPer100g: 0.5, caloriesPer100g: 345 },
  "Soya Chunks (cooked)": { name: "Soya Chunks (cooked)", proteinPer100g: 17, carbsPer100g: 11, fatsPer100g: 0.2, caloriesPer100g: 115 },
  "Moong Dal (cooked)": { name: "Moong Dal (cooked)", proteinPer100g: 7.0, carbsPer100g: 19.0, fatsPer100g: 0.4, caloriesPer100g: 105 },
  "Chana Dal (cooked)": { name: "Chana Dal (cooked)", proteinPer100g: 9.0, carbsPer100g: 27.0, fatsPer100g: 2.7, caloriesPer100g: 164 },
  "Masoor Dal (cooked)": { name: "Masoor Dal (cooked)", proteinPer100g: 9.0, carbsPer100g: 20.0, fatsPer100g: 0.4, caloriesPer100g: 116 },
  "Kidney Beans/Rajma (cooked)": { name: "Kidney Beans/Rajma (cooked)", proteinPer100g: 8.7, carbsPer100g: 22.8, fatsPer100g: 0.5, caloriesPer100g: 127 },
  "Whey Protein (scoop ~30g)": { name: "Whey Protein (scoop ~30g)", proteinPer100g: 80, carbsPer100g: 5, fatsPer100g: 3, caloriesPer100g: 370 },
  "Greek Yogurt": { name: "Greek Yogurt", proteinPer100g: 10, carbsPer100g: 3.6, fatsPer100g: 0.4, caloriesPer100g: 59 },
  "Low-fat Milk": { name: "Low-fat Milk", proteinPer100g: 3.4, carbsPer100g: 4.8, fatsPer100g: 1.0, caloriesPer100g: 42 },
  "Tofu": { name: "Tofu", proteinPer100g: 8, carbsPer100g: 2, fatsPer100g: 4.5, caloriesPer100g: 76 },
  "Edamame": { name: "Edamame", proteinPer100g: 11, carbsPer100g: 10, fatsPer100g: 5, caloriesPer100g: 121 },
  "Oats": { name: "Oats", proteinPer100g: 13.1, carbsPer100g: 67, fatsPer100g: 6.9, caloriesPer100g: 389 },
  "Brown Rice (cooked)": { name: "Brown Rice (cooked)", proteinPer100g: 2.6, carbsPer100g: 23, fatsPer100g: 0.9, caloriesPer100g: 112 },
  "Whole Wheat Roti": { name: "Whole Wheat Roti", proteinPer100g: 8, carbsPer100g: 50, fatsPer100g: 3, caloriesPer100g: 257 },
  "Peanut Butter": { name: "Peanut Butter", proteinPer100g: 25, carbsPer100g: 20, fatsPer100g: 50, caloriesPer100g: 588 },
  "Almonds": { name: "Almonds", proteinPer100g: 21, carbsPer100g: 22, fatsPer100g: 50, caloriesPer100g: 579 },
  "Cottage Cheese (low-fat)": { name: "Cottage Cheese (low-fat)", proteinPer100g: 11, carbsPer100g: 3.4, fatsPer100g: 1.0, caloriesPer100g: 72 },
};

function calcMacros(ingredient: IngredientData, quantityG: number): MealIngredientOut {
  const factor = quantityG / 100;
  return {
    name: ingredient.name,
    quantityG,
    proteinG: Math.round(ingredient.proteinPer100g * factor * 10) / 10,
    carbsG: Math.round(ingredient.carbsPer100g * factor * 10) / 10,
    fatsG: Math.round(ingredient.fatsPer100g * factor * 10) / 10,
    caloriesKcal: Math.round(ingredient.caloriesPer100g * factor * 10) / 10,
  };
}

function sumMacros(ingredients: MealIngredientOut[]) {
  return {
    proteinG: Math.round(ingredients.reduce((s, i) => s + i.proteinG, 0) * 10) / 10,
    carbsG: Math.round(ingredients.reduce((s, i) => s + i.carbsG, 0) * 10) / 10,
    fatsG: Math.round(ingredients.reduce((s, i) => s + i.fatsG, 0) * 10) / 10,
    caloriesKcal: Math.round(ingredients.reduce((s, i) => s + i.caloriesKcal, 0) * 10) / 10,
  };
}

function makeWheyShake(extraProteinNeeded: number): MealOut {
  const scoops = Math.max(1, Math.min(2, Math.ceil(extraProteinNeeded / 24)));
  const wheyG = scoops * 30;
  const milkG = 250;
  const ingredients = [
    calcMacros(INGREDIENTS_DB["Whey Protein (scoop ~30g)"]!, wheyG),
    calcMacros(INGREDIENTS_DB["Low-fat Milk"]!, milkG),
  ];
  const macros = sumMacros(ingredients);
  return {
    name: `Whey Protein Shake (${scoops} scoop${scoops > 1 ? "s" : ""})`,
    mealType: "post_workout",
    ingredients,
    ...macros,
    notes: "Mix well and consume within 30 minutes post-workout for optimal recovery.",
  };
}

const MEAL_TEMPLATES: Array<{
  name: string;
  mealType: string;
  components: Array<{ key: string; g: number }>;
  notes: string | null;
}> = [
  {
    name: "Paneer Bhurji with Roti",
    mealType: "lunch",
    components: [
      { key: "Paneer", g: 150 },
      { key: "Whole Wheat Roti", g: 80 },
    ],
    notes: "Season with cumin, turmeric, and tomatoes. High-protein vegetarian staple.",
  },
  {
    name: "Soya Chunk Curry with Brown Rice",
    mealType: "dinner",
    components: [
      { key: "Soya Chunks (cooked)", g: 200 },
      { key: "Brown Rice (cooked)", g: 150 },
    ],
    notes: "Soya chunks are an exceptional plant-based protein. Soak 30 min before cooking.",
  },
  {
    name: "High-Protein Oat Bowl",
    mealType: "breakfast",
    components: [
      { key: "Oats", g: 80 },
      { key: "Greek Yogurt", g: 150 },
      { key: "Peanut Butter", g: 30 },
    ],
    notes: "Slow-digesting carbs + casein from Greek yogurt = sustained energy.",
  },
  {
    name: "Rajma (Kidney Bean) Curry with Roti",
    mealType: "lunch",
    components: [
      { key: "Kidney Beans/Rajma (cooked)", g: 200 },
      { key: "Whole Wheat Roti", g: 80 },
    ],
    notes: "Rich in plant protein and complex carbs. Perfect post-legs-day meal.",
  },
  {
    name: "Moong Dal Khichdi",
    mealType: "dinner",
    components: [
      { key: "Moong Dal (cooked)", g: 200 },
      { key: "Brown Rice (cooked)", g: 100 },
    ],
    notes: "Easy to digest. Great for rest days or light recovery meals.",
  },
  {
    name: "Masoor Dal with Roti",
    mealType: "dinner",
    components: [
      { key: "Masoor Dal (cooked)", g: 200 },
      { key: "Whole Wheat Roti", g: 60 },
    ],
    notes: "Red lentils are quick-cooking and nutrient-dense.",
  },
  {
    name: "Tofu Stir Fry with Brown Rice",
    mealType: "lunch",
    components: [
      { key: "Tofu", g: 200 },
      { key: "Brown Rice (cooked)", g: 150 },
      { key: "Edamame", g: 80 },
    ],
    notes: "High-protein plant-based meal. Press tofu before cooking for best texture.",
  },
  {
    name: "Greek Yogurt Parfait",
    mealType: "snack",
    components: [
      { key: "Greek Yogurt", g: 200 },
      { key: "Almonds", g: 25 },
    ],
    notes: "Perfect mid-morning or pre-workout snack.",
  },
  {
    name: "Paneer Tikka",
    mealType: "snack",
    components: [
      { key: "Paneer", g: 120 },
    ],
    notes: "Grill with yogurt marinade, bell peppers, and Indian spices. Excellent pre-workout protein.",
  },
  {
    name: "Chana Dal Soup",
    mealType: "dinner",
    components: [
      { key: "Chana Dal (cooked)", g: 200 },
    ],
    notes: "Slow-digesting protein. Great for maintaining satiety on fat-loss goals.",
  },
  {
    name: "Cottage Cheese & Peanut Butter Toast",
    mealType: "breakfast",
    components: [
      { key: "Cottage Cheese (low-fat)", g: 150 },
      { key: "Peanut Butter", g: 20 },
      { key: "Whole Wheat Roti", g: 60 },
    ],
    notes: "Casein-rich slow-digesting breakfast. Good for muscle preservation.",
  },
  {
    name: "Soya Chunks Salad Bowl",
    mealType: "lunch",
    components: [
      { key: "Soya Chunks (cooked)", g: 150 },
      { key: "Edamame", g: 100 },
      { key: "Greek Yogurt", g: 100 },
    ],
    notes: "Cold salad with soya, edamame, and a yogurt-lime dressing.",
  },
];

export function calculateMacros(
  weightKg: number,
  goal: string,
  activityLevel: string,
  heightCm?: number | null,
  ageYears?: number | null
): MacroTargets {
  // Mifflin-St Jeor BMR (use default for unknown height/age)
  let bmr: number;
  if (heightCm && ageYears) {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5; // male approximation
  } else {
    bmr = 10 * weightKg + 6.25 * 170 - 5 * 25 + 5;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] ?? 1.55);

  let dailyCaloriesKcal: number;
  if (goal === "muscle_gain") {
    dailyCaloriesKcal = Math.round(tdee + 300);
  } else if (goal === "fat_loss") {
    dailyCaloriesKcal = Math.round(tdee - 400);
  } else {
    dailyCaloriesKcal = Math.round(tdee);
  }

  // Protein: 1.8g/kg for muscle gain, 2.0g/kg for fat loss (muscle preservation), 1.6g/kg maintenance
  const proteinPerKgMap: Record<string, number> = {
    muscle_gain: 1.8,
    fat_loss: 2.0,
    maintenance: 1.6,
  };
  const proteinPerKg = proteinPerKgMap[goal] ?? 1.8;
  const dailyProteinG = Math.round(weightKg * proteinPerKg);

  // Fat: 25% of calories
  const dailyFatsG = Math.round((dailyCaloriesKcal * 0.25) / 9);

  // Carbs fill remainder
  const proteinCals = dailyProteinG * 4;
  const fatCals = dailyFatsG * 9;
  const dailyCarbsG = Math.round((dailyCaloriesKcal - proteinCals - fatCals) / 4);

  return {
    dailyCaloriesKcal,
    dailyProteinG,
    dailyCarbsG: Math.max(0, dailyCarbsG),
    dailyFatsG,
    proteinPerKg,
  };
}

export function generateWeekPlan(targets: MacroTargets): DayPlanOut[] {
  const PPL_SCHEDULE = ["push", "pull", "legs", "push", "pull", "legs", "rest"];
  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return PPL_SCHEDULE.map((workoutType, index) => {
    // Rotate through meal templates based on day
    const offset = index * 3;
    const template1 = MEAL_TEMPLATES[(offset) % MEAL_TEMPLATES.length]!;
    const template2 = MEAL_TEMPLATES[(offset + 4) % MEAL_TEMPLATES.length]!;
    const breakfastTemplate = MEAL_TEMPLATES[(offset + 8) % MEAL_TEMPLATES.length]!;

    const buildMeal = (template: typeof template1): MealOut => {
      const ingredients = template.components.map(({ key, g }) => {
        const ing = INGREDIENTS_DB[key];
        if (!ing) throw new Error(`Unknown ingredient: ${key}`);
        return calcMacros(ing, g);
      });
      const macros = sumMacros(ingredients);
      return { name: template.name, mealType: template.mealType, ingredients, ...macros, notes: template.notes };
    };

    const breakfast = buildMeal(breakfastTemplate.mealType === "breakfast" ? breakfastTemplate : MEAL_TEMPLATES[2]!);
    const lunch = buildMeal(template1.mealType === "lunch" ? template1 : MEAL_TEMPLATES[0]!);
    const dinner = buildMeal(template2.mealType === "dinner" ? template2 : MEAL_TEMPLATES[1]!);

    const meals: MealOut[] = [breakfast, lunch, dinner];

    // Add whey shake on workout days
    if (workoutType !== "rest") {
      const currentProtein = meals.reduce((s, m) => s + m.proteinG, 0);
      const needed = targets.dailyProteinG - currentProtein;
      const wheyShake = makeWheyShake(needed);
      meals.push(wheyShake);
    }

    // Add snack
    const snack = buildMeal(MEAL_TEMPLATES[7]!);
    meals.push(snack);

    const totalProteinG = Math.round(meals.reduce((s, m) => s + m.proteinG, 0) * 10) / 10;
    const totalCarbsG = Math.round(meals.reduce((s, m) => s + m.carbsG, 0) * 10) / 10;
    const totalFatsG = Math.round(meals.reduce((s, m) => s + m.fatsG, 0) * 10) / 10;
    const totalCaloriesKcal = Math.round(meals.reduce((s, m) => s + m.caloriesKcal, 0) * 10) / 10;

    return {
      dayNumber: index + 1,
      dayName: DAY_NAMES[index]!,
      workoutType: workoutType === "rest" ? "rest" : workoutType,
      meals,
      totalProteinG,
      totalCarbsG,
      totalFatsG,
      totalCaloriesKcal,
    };
  });
}
