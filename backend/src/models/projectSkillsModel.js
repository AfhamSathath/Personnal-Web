// src/models/projectSkillsModel.js
import pool from "../db.js";

// --- GET ALL SKILLS FOR A PROJECT ---
export const getByProjectId = async (projectId) => {
  const [rows] = await pool.query(
    `SELECT ps.id, ps.project_id, ps.skill_id, s.name AS skill_name, ps.min_level
     FROM project_skills ps
     JOIN skills s ON ps.skill_id = s.id
     WHERE ps.project_id = ?`,
    [projectId]
  );
  return rows;
};

// --- ADD SKILL TO A PROJECT ---
export const addSkill = async ({ project_id, skill_id, min_level }) => {
  const [result] = await pool.query(
    `INSERT INTO project_skills (project_id, skill_id, min_level) VALUES (?, ?, ?)`,
    [project_id, skill_id, min_level || "Beginner"]
  );
  return result.insertId;
};

// --- ADD MULTIPLE SKILLS AT ONCE ---
export const addMultipleSkills = async (project_id, skills) => {
  // skills = [{ skill_id, min_level }, ...]
  if (!skills || skills.length === 0) return;

  const values = skills.map(skill => [project_id, skill.skill_id, skill.min_level || "Beginner"]);
  const [result] = await pool.query(
    `INSERT INTO project_skills (project_id, skill_id, min_level) VALUES ?`,
    [values]
  );
  return result;
};

// --- UPDATE A SKILL IN A PROJECT ---
export const updateSkill = async (id, { min_level }) => {
  const [result] = await pool.query(
    `UPDATE project_skills SET min_level = ? WHERE id = ?`,
    [min_level, id]
  );
  return result.affectedRows;
};

// --- REMOVE A SKILL FROM A PROJECT ---
export const removeSkill = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM project_skills WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};

// --- REMOVE ALL SKILLS FOR A PROJECT ---
export const removeAllSkillsForProject = async (projectId) => {
  const [result] = await pool.query(
    `DELETE FROM project_skills WHERE project_id = ?`,
    [projectId]
  );
  return result.affectedRows;
};

// --- EXPORT MODEL ---
export const projectSkillsModel = {
  getByProjectId,
  addSkill,
  addMultipleSkills,
  updateSkill,
  removeSkill,
  removeAllSkillsForProject,
};
