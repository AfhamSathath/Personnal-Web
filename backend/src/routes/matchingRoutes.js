import express from "express";
import { matchPersonnelToProject } from "../controllers/matchingController.js";

const router = express.Router();

router.get("/project/:projectId", matchPersonnelToProject);

export default router;
