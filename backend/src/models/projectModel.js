// backend/src/models/projectModel.js
import { db } from "../db.js";

export const projectModel = {
  getAll: async () => {
    const [projects] = await db.query("SELECT * FROM projects ORDER BY id DESC");
    const [skills] = await db.query(`
      SELECT ps.project_id, s.id AS skill_id, s.name, ps.min_level
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
    `);
    return projects.map(p => ({
      ...p,
      skills: skills.filter(s => s.project_id === p.id)
    }));
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM projects WHERE id=?", [id]);
    if (!rows.length) return null;
    const project = rows[0];
    const [skills] = await db.query(`
      SELECT ps.project_id, s.id AS skill_id, s.name, ps.min_level
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id=?
    `, [id]);
    project.skills = skills;
    return project;
  },

  create: async ({ name, description, start_date, end_date, status, skills }) => {
    const [res] = await db.query(
      "INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, start_date || null, end_date || null, status]
    );
    const projectId = res.insertId;
    if (skills?.length) {
      for (const skill of skills) {
        await db.query(
          "INSERT INTO project_skills (project_id, skill_id, min_level) VALUES (?, ?, ?)",
          [projectId, skill.skill_id, skill.min_level]
        );
      }
    }
    return projectId;
  },

  update: async (id, { name, description, start_date, end_date, status, skills }) => {
    await db.query(
      "UPDATE projects SET name=?, description=?, start_date=?, end_date=?, status=? WHERE id=?",
      [name, description || null, start_date || null, end_date || null, status, id]
    );
    await db.query("DELETE FROM project_skills WHERE project_id=?", [id]);
    if (skills?.length) {
      for (const skill of skills) {
        await db.query(
          "INSERT INTO project_skills (project_id, skill_id, min_level) VALUES (?, ?, ?)",
          [id, skill.skill_id, skill.min_level]
        );
      }
    }
  },

  delete: async (id) => {
    await db.query("DELETE FROM projects WHERE id=?", [id]);
  }
};
