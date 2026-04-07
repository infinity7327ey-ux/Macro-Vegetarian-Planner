import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  CreateProfileBody,
  UpdateProfileBody,
  GetProfileParams,
  UpdateProfileParams,
  CalculateMacroTargetsBody,
} from "@workspace/api-zod";
import { calculateMacros } from "../lib/meal-generator";

const router: IRouter = Router();

router.get("/profiles", async (req, res): Promise<void> => {
  const profiles = await db.select().from(profilesTable).orderBy(profilesTable.createdAt);
  res.json(profiles);
});

router.post("/profiles", async (req, res): Promise<void> => {
  const parsed = CreateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [profile] = await db.insert(profilesTable).values({
    name: data.name,
    weightKg: data.weightKg,
    heightCm: data.heightCm ?? null,
    ageYears: data.ageYears ?? null,
    goal: data.goal ?? "muscle_gain",
    activityLevel: data.activityLevel ?? "moderately_active",
    dietaryRestrictions: data.dietaryRestrictions ?? [],
    preferredProteins: data.preferredProteins ?? [],
  }).returning();

  res.status(201).json(profile);
});

router.get("/profiles/:id", async (req, res): Promise<void> => {
  const params = GetProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, params.data.id));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(profile);
});

router.patch("/profiles/:id", async (req, res): Promise<void> => {
  const params = UpdateProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [profile] = await db
    .update(profilesTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(profilesTable.id, params.data.id))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(profile);
});

router.post("/macro-targets", async (req, res): Promise<void> => {
  const parsed = CalculateMacroTargetsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { weightKg, heightCm, ageYears, goal, activityLevel } = parsed.data;

  const targets = calculateMacros(
    weightKg,
    goal,
    activityLevel,
    heightCm ?? undefined,
    ageYears ?? undefined,
  );

  res.json(targets);
});

export default router;
