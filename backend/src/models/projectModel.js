// src/models/projectModel.js
import pool from "../db.js";

// --- PROJECT CRUD ---

export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
  return rows[0];
};

export const create = async ({ name, description, start_date, end_date, status, skills }) => {
  const [result] = await pool.query(
    "INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)",
    [name, description, start_date, end_date, status || "Planning"]
  );
  const projectId = result.insertId;

  if (skills && skills.length > 0) {
    const skillValues = skills.map(skill => [projectId, skill.skill_name, skill.min_level]);
    await pool.query(
      "INSERT INTO project_skills (project_id, skill_name, min_level) VALUES ?",
      [skillValues]
    );
  }

  return projectId;
};

export const update = async (id, { name, description, start_date, end_date, status, skills }) => {
  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (description !== undefined) { fields.push("description = ?"); values.push(description); }
  if (start_date !== undefined) { fields.push("start_date = ?"); values.push(start_date); }
  if (end_date !== undefined) { fields.push("end_date = ?"); values.push(end_date); }
  if (status !== undefined) { fields.push("status = ?"); values.push(status); }

  if (fields.length > 0) {
    values.push(id);
    const query = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(query, values);
  }

  if (skills) {
    // Remove old skills
    await pool.query("DELETE FROM project_skills WHERE project_id = ?", [id]);

    // Insert new skills
    if (skills.length > 0) {
      const skillValues = skills.map(skill => [id, skill.skill_name, skill.min_level]);
      await pool.query(
        "INSERT INTO project_skills (project_id, skill_name, min_level) VALUES ?",
        [skillValues]
      );
    }
  }

  return id;
};

export const deleteById = async (id) => {
  // project_skills will be deleted automatically due to ON DELETE CASCADE
  const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [id]);
  return result;
};

// --- PROJECT SKILLS ---

export const getSkills = async (projectId) => {
  const [rows] = await pool.query("SELECT * FROM project_skills WHERE project_id = ?", [projectId]);
  return rows;
};

// --- EXPORT MODEL ---

export const projectModel = {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
  getSkills
};
