import { db } from "../db.js";

export const SkillModel = {
  async getAll() {
    const [rows] = await db.query("SELECT * FROM skills");
    return rows;
  },

  async create({ name, category, description }) {
    const [result] = await db.query(
      "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
      [name, category, description]
    );
    return { id: result.insertId, name, category, description };
  },

  async update(id, { name, category, description }) {
    await pool.query(
      "UPDATE skills SET name=?, category=?, description=? WHERE id=?",
      [name, category, description, id]
    );
    return { id, name, category, description };
  },

  async delete(id) {
    await pool.query("DELETE FROM skills WHERE id=?", [id]);
    return { message: "Skill deleted" };
  }
};
