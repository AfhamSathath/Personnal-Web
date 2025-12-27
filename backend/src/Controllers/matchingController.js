import { db } from "../db.js";

const LEVEL_WEIGHT = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4
};

export const matchPersonnelToProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    //  Project required skills
    const [projectSkills] = await db.query(`
      SELECT ps.skill_id, s.name AS skill_name, ps.min_level
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id = ?
    `, [projectId]);

    if (projectSkills.length === 0) {
      return res.status(404).json({ message: "No skills defined for this project" });
    }

    //  Personnel skills
    const [personnelSkills] = await db.query(`
      SELECT p.id, p.name AS personnel_name,
             s.id AS skill_id, s.name AS skill_name,
             ps.proficiency
      FROM personnel_skills ps
      JOIN personnel p ON ps.personnel_id = p.id
      JOIN skills s ON ps.skill_id = s.id
    `);

    //  Matching logic
    const personnelMap = {};

    personnelSkills.forEach(row => {
      if (!personnelMap[row.id]) {
        personnelMap[row.id] = {
          personnelId: row.id,
          name: row.personnel_name,
          score: 0,
          matchedSkills: []
        };
      }

      const requiredSkill = projectSkills.find(
        ps => ps.skill_id === row.skill_id
      );

      if (requiredSkill) {
        const personLevel = LEVEL_WEIGHT[row.proficiency];
        const minLevel = LEVEL_WEIGHT[requiredSkill.min_level];

        if (personLevel >= minLevel) {
          personnelMap[row.id].score += personLevel;
          personnelMap[row.id].matchedSkills.push({
            skill: row.skill_name,
            level: row.proficiency
          });
        }
      }
    });

    const matchedPersonnel = Object.values(personnelMap)
      .filter(p => p.matchedSkills.length > 0)
      .sort((a, b) => b.score - a.score);

    res.json({
      projectId,
      projectRequirements: projectSkills,
      matchedPersonnel
    });

  } catch (error) {
    res.status(500).json({ message: "Matching failed", error });
  }
};
