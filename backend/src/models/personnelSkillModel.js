import { pool } from "../db.js";

export const PersonnelSkillModel = {
  //  ASSIGN SKILL 
  async assign({ personnelId, skillId, proficiency }) {
    // Convert IDs to numbers to avoid DB issues
    const pid = Number(personnelId);
    const sid = Number(skillId);

    // Check if this skill is already assigned to this personnel
    const [existing] = await pool.query(
      "SELECT * FROM personnel_skills WHERE personnel_id = ? AND skill_id = ?",
      [pid, sid]
    );

    if (existing.length > 0) {
      throw new Error("Skill already assigned to this personnel");
    }

    // Insert assignment
    const [result] = await pool.query(
      "INSERT INTO personnel_skills (personnel_id, skill_id, proficiency) VALUES (?, ?, ?)",
      [pid, sid, proficiency]
    );

    return {
      id: result.insertId,
      personnelId: pid,
      skillId: sid,
      proficiency,
    };
  },

  //  GET SKILLS BY PERSONNEL 
  async getSkillsByPersonnel(personnelId) {
    const pid = Number(personnelId);
    const [rows] = await pool.query(
      `SELECT ps.id, s.id AS skillId, s.name AS skillName, s.category, ps.proficiency
       FROM personnel_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.personnel_id = ?`,
      [pid]
    );
    return rows;
  },

  // GET PERSONNEL BY SKILL 
  async getPersonnelBySkill(skillId) {
    const sid = Number(skillId);
    const [rows] = await pool.query(
      `SELECT ps.id, p.id AS personnelId, p.name AS personnelName, ps.proficiency
       FROM personnel_skills ps
       JOIN personnel p ON ps.personnel_id = p.id
       WHERE ps.skill_id = ?`,
      [sid]
    );
    return rows;
  },

  // DELETE ASSIGNMENT 
  async removeAssignment({ personnelId, skillId }) {
    const pid = Number(personnelId);
    const sid = Number(skillId);
    const [result] = await pool.query(
      "DELETE FROM personnel_skills WHERE personnel_id = ? AND skill_id = ?",
      [pid, sid]
    );
    return result.affectedRows > 0;
  }
};
