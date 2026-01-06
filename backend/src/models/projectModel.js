import { db } from "../db.js";

export const projectModel = {

  /* ================================
     GET ALL PROJECTS
  ================================ */
  getAll: async () => {
    const [projects] = await db.query(
      "SELECT * FROM projects ORDER BY id DESC"
    );

    const [skills] = await db.query(`
      SELECT ps.project_id,
             s.id AS skill_id,
             s.name,
             ps.min_level
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
    `);

    return projects.map(project => ({
      ...project,
      skills: skills.filter(skill => skill.project_id === project.id)
    }));
  },

  /* ================================
     GET PROJECT BY ID
  ================================ */
  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM projects WHERE id = ?",
      [id]
    );

    if (!rows.length) return null;

    const project = rows[0];

    const [skills] = await db.query(
      `SELECT ps.project_id,
              s.id AS skill_id,
              s.name,
              ps.min_level
       FROM project_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.project_id = ?`,
      [id]
    );

    project.skills = skills;
    return project;
  },

  /* ================================
     CREATE PROJECT (TRANSACTION SAFE)
  ================================ */
  create: async ({ name, description, start_date, end_date, status, skills }) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO projects
         (name, description, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          name,
          description || null,
          start_date || null,
          end_date || null,
          status
        ]
      );

      const projectId = result.insertId;

      if (Array.isArray(skills) && skills.length > 0) {
        for (const skill of skills) {
          await conn.query(
            `INSERT INTO project_skills
             (project_id, skill_id, min_level)
             VALUES (?, ?, ?)`,
            [projectId, skill.skill_id, skill.min_level]
          );
        }
      }

      await conn.commit();
      return projectId;

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /* ================================
     UPDATE PROJECT
  ================================ */
  update: async (id, { name, description, start_date, end_date, status, skills }) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE projects
         SET name = ?,
             description = ?,
             start_date = ?,
             end_date = ?,
             status = ?
         WHERE id = ?`,
        [
          name,
          description || null,
          start_date || null,
          end_date || null,
          status,
          id
        ]
      );

      await conn.query(
        "DELETE FROM project_skills WHERE project_id = ?",
        [id]
      );

      if (Array.isArray(skills) && skills.length > 0) {
        for (const skill of skills) {
          await conn.query(
            `INSERT INTO project_skills
             (project_id, skill_id, min_level)
             VALUES (?, ?, ?)`,
            [id, skill.skill_id, skill.min_level]
          );
        }
      }

      await conn.commit();

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /* ================================
     DELETE PROJECT
  ================================ */
  delete: async (id) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        "DELETE FROM project_skills WHERE project_id = ?",
        [id]
      );

      await conn.query(
        "DELETE FROM projects WHERE id = ?",
        [id]
      );

      await conn.commit();

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
};
