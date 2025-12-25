// matchingRoutes.js
import express from "express";
import { matchPersonnel } from "../Controllers/matchingController.js";
const router = express.Router();
router.get("/:projectId", matchPersonnel);
export default router;
