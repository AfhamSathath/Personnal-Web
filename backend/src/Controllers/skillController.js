// backend/src/Controllers/skillController.js
import { db } from "../db.js";

// GET all skills
export const getSkills = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM skills ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/skills error:", err);
    res.status(500).json({ message: "Failed to fetch skills" });
  }
};

// POST add a new skill
export const addSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) return res.status(400).json({ message: "Name and category required" });

    // Check duplicate
    const [existing] = await db.query("SELECT * FROM skills WHERE name = ?", [name]);
    if (existing.length > 0) return res.status(409).json({ message: "Skill already exists" });

    // INSERT without specifying ID
    const [result] = await db.query(
      "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
      [name, category, description || null]
    );

    const [newSkill] = await db.query("SELECT * FROM skills WHERE id = ?", [result.insertId]);
    res.status(201).json(newSkill[0]);
  } catch (err) {
    console.error("POST /api/skills error:", err);
    res.status(500).json({ message: "Failed to add skill" });
  }
};

// PUT update skill
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;
    if (!name || !category) return res.status(400).json({ message: "Name and category required" });

    const [result] = await db.query(
      "UPDATE skills SET name=?, category=?, description=? WHERE id=?",
      [name, category, description || null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Skill not found" });

    const [updatedSkill] = await db.query("SELECT * FROM skills WHERE id = ?", [id]);
    res.json(updatedSkill[0]);
  } catch (err) {
    console.error("PUT /api/skills/:id error:", err);
    res.status(500).json({ message: "Failed to update skill" });
  }
};

// DELETE skill
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM skills WHERE id=?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Skill not found" });

    res.json({ message: "Skill deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/skills/:id error:", err);
    res.status(500).json({ message: "Failed to delete skill" });
  }
};
