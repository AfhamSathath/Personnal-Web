import express from "express";
import { matchPersonnelToProject } from "../Controllers/matchingController.js";

const router = express.Router();

// GET matched personnel for a project
router.get("/projects/:projectId/matched-personnel", matchPersonnelToProject);

export default router;
