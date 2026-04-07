import { Router, type IRouter } from "express";
import { db, ingredientsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/ingredients", async (_req, res): Promise<void> => {
  const ingredients = await db.select().from(ingredientsTable).orderBy(ingredientsTable.name);
  res.json(ingredients);
});

export default router;
