// skillRoutes.js
import express from "express";
import { createSkill, updateSkill, assignSkill } from "../Controllers/skillController.js";
const router = express.Router();
router.post("/", createSkill);
router.put("/:id", updateSkill);
router.post("/assign", assignSkill);
export default router;
