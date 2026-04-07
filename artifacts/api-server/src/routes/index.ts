import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import ingredientsRouter from "./ingredients";
import mealPlansRouter from "./meal-plans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(ingredientsRouter);
router.use(mealPlansRouter);

export default router;
