import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, mealPlansTable, profilesTable } from "@workspace/db";
import {
  CreateMealPlanBody,
  GetMealPlanParams,
  DeleteMealPlanParams,
  GetMealPlanSummaryParams,
  ListMealPlansQueryParams,
} from "@workspace/api-zod";
import { calculateMacros, generateWeekPlan } from "../lib/meal-generator";

const router: IRouter = Router();

router.get("/meal-plans", async (req, res): Promise<void> => {
  const queryParams = ListMealPlansQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const { profileId } = queryParams.data;

  const plans = profileId
    ? await db.select().from(mealPlansTable).where(eq(mealPlansTable.profileId, profileId)).orderBy(mealPlansTable.createdAt)
    : await db.select().from(mealPlansTable).orderBy(mealPlansTable.createdAt);

  res.json(plans);
});

router.post("/meal-plans", async (req, res): Promise<void> => {
  const parsed = CreateMealPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { profileId, weekNumber } = parsed.data;

  // Load profile to get macro targets
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const targets = calculateMacros(
    profile.weightKg,
    profile.goal,
    profile.activityLevel,
    profile.heightCm ?? undefined,
    profile.ageYears ?? undefined,
  );

  const days = generateWeekPlan(targets);

  const [mealPlan] = await db.insert(mealPlansTable).values({
    profileId,
    weekNumber: weekNumber ?? 1,
    days: days as unknown as Record<string, unknown>[],
    targetProteinG: targets.dailyProteinG,
    targetCaloriesKcal: targets.dailyCaloriesKcal,
  }).returning();

  res.status(201).json(mealPlan);
});

router.get("/meal-plans/:id", async (req, res): Promise<void> => {
  const params = GetMealPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db.select().from(mealPlansTable).where(eq(mealPlansTable.id, params.data.id));

  if (!plan) {
    res.status(404).json({ error: "Meal plan not found" });
    return;
  }

  res.json(plan);
});

router.delete("/meal-plans/:id", async (req, res): Promise<void> => {
  const params = DeleteMealPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db.delete(mealPlansTable).where(eq(mealPlansTable.id, params.data.id)).returning();

  if (!plan) {
    res.status(404).json({ error: "Meal plan not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/meal-plans/:id/summary", async (req, res): Promise<void> => {
  const params = GetMealPlanSummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db.select().from(mealPlansTable).where(eq(mealPlansTable.id, params.data.id));

  if (!plan) {
    res.status(404).json({ error: "Meal plan not found" });
    return;
  }

  type DayPlan = {
    totalProteinG: number;
    totalCarbsG: number;
    totalFatsG: number;
    totalCaloriesKcal: number;
    meals: Array<{
      ingredients: Array<{ name: string }>;
    }>;
  };

  const days = plan.days as DayPlan[];
  const numDays = days.length;

  const weeklyProteinG = days.reduce((s, d) => s + d.totalProteinG, 0);
  const weeklyCaloriesKcal = days.reduce((s, d) => s + d.totalCaloriesKcal, 0);
  const weeklyCarbsG = days.reduce((s, d) => s + d.totalCarbsG, 0);
  const weeklyFatsG = days.reduce((s, d) => s + d.totalFatsG, 0);

  const avgDailyProteinG = Math.round((weeklyProteinG / numDays) * 10) / 10;
  const avgDailyCaloriesKcal = Math.round((weeklyCaloriesKcal / numDays) * 10) / 10;
  const avgDailyCarbsG = Math.round((weeklyCarbsG / numDays) * 10) / 10;
  const avgDailyFatsG = Math.round((weeklyFatsG / numDays) * 10) / 10;

  const proteinGoalMetDays = days.filter(d => d.totalProteinG >= plan.targetProteinG * 0.9).length;

  // Count ingredient frequency
  const ingredientCount: Record<string, number> = {};
  for (const day of days) {
    for (const meal of day.meals) {
      for (const ing of meal.ingredients) {
        ingredientCount[ing.name] = (ingredientCount[ing.name] ?? 0) + 1;
      }
    }
  }

  const topProteinSources = Object.entries(ingredientCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  res.json({
    mealPlanId: plan.id,
    avgDailyProteinG,
    avgDailyCaloriesKcal,
    avgDailyCarbsG,
    avgDailyFatsG,
    proteinGoalMetDays,
    topProteinSources,
    weeklyProteinG: Math.round(weeklyProteinG * 10) / 10,
    weeklyCaloriesKcal: Math.round(weeklyCaloriesKcal * 10) / 10,
  });
});

export default router;
