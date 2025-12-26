import express from "express";
import {
  getAllPersonnel,
  addPersonnel,
  updatePersonnel,
  deletePersonnel
} from "../Controllers/personnelController.js";

const router = express.Router();

router.get("/", getAllPersonnel);
router.post("/", addPersonnel);
router.put("/:id", updatePersonnel);
router.delete("/:id", deletePersonnel);

export default router;