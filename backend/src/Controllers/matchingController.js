import { db } from "../db.js";

/**
 * Proficiency weight mapping
 */
const LEVEL_WEIGHT = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4
};

/**
 * Match personnel to a project based on skill requirements
 * GET /api/projects/:projectId/match
 */
export const matchPersonnelToProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    /* =====================================================
       1. Fetch required skills for the project
    ===================================================== */
    const [projectSkills] = await db.query(
      `
      SELECT 
        ps.skill_id,
        ps.min_level,
        s.name AS skill_name
      FROM project_skills ps
      JOIN skills s ON s.id = ps.skill_id
      WHERE ps.project_id = ?
      `,
      [projectId]
    );

    if (!projectSkills.length) {
      return res.json([]);
    }

    /* =====================================================
       2. Fetch all personnel with their skills
    ===================================================== */
    const [rows] = await db.query(
      `
      SELECT
        p.id AS personnel_id,
        p.name AS personnel_name,
        s.id AS skill_id,
        s.name AS skill_name,
        ps.proficiency
      FROM personnel p
      LEFT JOIN personnel_skills ps ON ps.personnel_id = p.id
      LEFT JOIN skills s ON s.id = ps.skill_id
      `
    );

    /* =====================================================
       3. Group skills by personnel
    ===================================================== */
    const personnelMap = {};

    for (const row of rows) {
      if (!personnelMap[row.personnel_id]) {
        personnelMap[row.personnel_id] = {
          id: row.personnel_id,
          name: row.personnel_name,
          skills: []
        };
      }

      if (row.skill_id) {
        personnelMap[row.personnel_id].skills.push({
          skillId: row.skill_id,
          skillName: row.skill_name,
          proficiency: row.proficiency
        });
      }
    }

    /* =====================================================
       4. Matching logic
    ===================================================== */
    const results = [];

    for (const person of Object.values(personnelMap)) {
      let matchedSkills = 0;

      for (const requiredSkill of projectSkills) {
        const hasSkill = person.skills.find(
          skill =>
            skill.skillId === requiredSkill.skill_id &&
            LEVEL_WEIGHT[skill.proficiency] >=
              LEVEL_WEIGHT[requiredSkill.min_level]
        );

        if (hasSkill) matchedSkills++;
      }

      if (matchedSkills > 0) {
        results.push({
          personnelId: person.id,
          name: person.name,
          matchedSkills,
          totalRequiredSkills: projectSkills.length,
          matchScore: Math.round(
            (matchedSkills / projectSkills.length) * 100
          )
        });
      }
    }

    /* =====================================================
       5. Sort by best match
    ===================================================== */
    results.sort((a, b) => b.matchScore - a.matchScore);

    return res.json(results);

  } catch (error) {
    console.error("Matching Error:", error);
    return res.status(500).json({
      message: "Failed to match personnel to project"
    });
  }
};
