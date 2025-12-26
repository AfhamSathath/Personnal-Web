// src/routes/projectRoutes.js
import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from "../Controllers/projectController.js";

const router = express.Router();

router.get("/", getAllProjects);        // GET all projects
router.get("/:id", getProjectById);     // GET single project
router.post("/", createProject);        // CREATE project
router.put("/:id", updateProject);      // UPDATE project
router.delete("/:id", deleteProject);   // DELETE project

export default router;
