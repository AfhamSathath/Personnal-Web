// backend/src/Controllers/personnelSkillController.js
import { db } from "../db.js";


// GET all personnel skills
export const getPersonnelSkills = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ps.id, ps.personnel_id, p.name AS personnel_name,
             ps.skill_id, s.name AS skill_name, ps.proficiency
      FROM personnel_skills ps
      JOIN personnel p ON ps.personnel_id = p.id
      JOIN skills s ON ps.skill_id = s.id
      ORDER BY ps.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/personnel-skills error:", err);
    res.status(500).json({ message: "Failed to fetch personnel skills" });
  }
};

// POST assign skill to personnel
export const addPersonnelSkills = async (req, res) => {
  try {
    let { personnelId, skillId, proficiency } = req.body;

    // Convert IDs to numbers
    personnelId = Number(personnelId);
    skillId = Number(skillId);

    if (!personnelId || !skillId || !proficiency) {
      return res.status(400).json({ message: "personnelId, skillId, and proficiency are required" });
    }

    // Prevent duplicates
    const [existing] = await db.query(
      "SELECT * FROM personnel_skills WHERE personnel_id=? AND skill_id=?",
      [personnelId, skillId]
    );
    if (existing.length > 0) return res.status(409).json({ message: "This personnel already has this skill" });

    // Insert new skill assignment
    const [result] = await db.query(
      "INSERT INTO personnel_skills (personnel_id, skill_id, proficiency) VALUES (?, ?, ?)",
      [personnelId, skillId, proficiency]
    );

    const [newEntry] = await db.query("SELECT * FROM personnel_skills WHERE id=?", [result.insertId]);
    res.status(201).json(newEntry[0]);

  } catch (err) {
    console.error("POST /api/personnel-skills error:", err);
    res.status(500).json({ message: "Failed to add personnel skill" });
  }
};


// PUT update proficiency
export const updatePersonnelSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const { proficiency } = req.body;
    if (!proficiency) return res.status(400).json({ message: "proficiency is required" });

    const [result] = await db.query(
      "UPDATE personnel_skills SET proficiency=? WHERE id=?",
      [proficiency, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Personnel skill not found" });

    const [updated] = await db.query("SELECT * FROM personnel_skills WHERE id=?", [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("PUT /api/personnel-skills/:id error:", err);
    res.status(500).json({ message: "Failed to update personnel skill" });
  }
};

// DELETE personnel skill
export const deletePersonnelSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM personnel_skills WHERE id=?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Personnel skill not found" });

    res.json({ message: "Personnel skill deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/personnel-skills/:id error:", err);
    res.status(500).json({ message: "Failed to delete personnel skill" });
  }
};
