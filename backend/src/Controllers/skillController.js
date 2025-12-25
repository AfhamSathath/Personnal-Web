import { db } from "../db.js";

export const createSkill = (req, res) => {
  const { name, category, description } = req.body;
  db.query(
    "INSERT INTO skills (name,category,description) VALUES (?,?,?)",
    [name, category, description],
    () => res.json({ message: "Skill created" })
  );
};

export const updateSkill = (req, res) => {
  const { name, category, description } = req.body;
  db.query(
    "UPDATE skills SET name=?, category=?, description=? WHERE id=?",
    [name, category, description, req.params.id],
    () => res.json({ message: "Skill updated" })
  );
};

export const assignSkill = (req, res) => {
  const { personnel_id, skill_id, proficiency } = req.body;
  db.query(
    "INSERT INTO personnel_skills VALUES (NULL,?,?,?)",
    [personnel_id, skill_id, proficiency],
    () => res.json({ message: "Skill assigned" })
  );
};
