import { getAllPersonnel, createPersonnel, updatePersonnel, deletePersonnel } from "../models/personnelModel.js";

export const getPersonnel = async (req, res) => {
  try {
    const personnel = await getAllPersonnel();
    res.json(personnel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch personnel" });
  }
};

export const addPersonnel = async (req, res) => {
  try {
    const { name, email, role, experience } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email required" });

    const newPersonnel = await createPersonnel({ name, email, role, experience });
    res.status(201).json(newPersonnel);
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") res.status(409).json({ message: "Email already exists" });
    else res.status(500).json({ message: "Failed to add personnel" });
  }
};

export const editPersonnel = async (req, res) => {
  try {
    const updated = await updatePersonnel(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update personnel" });
  }
};

export const removePersonnel = async (req, res) => {
  try {
    const deleted = await deletePersonnel(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Personnel not found" });
    res.json({ message: "Personnel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete personnel" });
  }
};
