import express from "express";
import { getPersonnelSkills, addPersonnelSkills, updatePersonnelSkills, deletePersonnelSkills } from "../Controllers/personnelSkillController.js";
const router = express.Router();

router.get("/", getPersonnelSkills);
router.post("/", addPersonnelSkills);
router.put("/:id", updatePersonnelSkills);
router.delete("/:id", deletePersonnelSkills);

export default router;
