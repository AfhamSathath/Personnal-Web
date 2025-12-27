import express from "express";
import { matchPersonnelToProject } from "../controllers/matchingController.js";

const router = express.Router();

// Match personnel to a project
router.get("/:projectId", matchPersonnelToProject);

export default router;
