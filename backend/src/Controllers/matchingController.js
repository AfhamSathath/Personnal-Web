import db from "../config/db.js";

const LEVEL_WEIGHT = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4
};

export const matchPersonnelToProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // 1️⃣ Required skills for project
    const [projectSkills] = await db.query(`
      SELECT ps.skill_id, ps.min_level, s.name
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id = ?
    `, [projectId]);

    if (projectSkills.length === 0)
      return res.json([]);

    // 2️⃣ All personnel with their skills
    const [personnelSkills] = await db.query(`
      SELECT 
        p.id AS personnel_id,
        p.name,
        s.id AS skill_id,
        s.name AS skill_name,
        ps.proficiency
      FROM personnel p
      LEFT JOIN personnel_skills ps ON p.id = ps.personnel_id
      LEFT JOIN skills s ON ps.skill_id = s.id
    `);

    // 3️⃣ Group by personnel
    const personnelMap = {};
    personnelSkills.forEach(row => {
      if (!personnelMap[row.personnel_id]) {
        personnelMap[row.personnel_id] = {
          id: row.personnel_id,
          name: row.name,
          skills: []
        };
      }
      if (row.skill_id) {
        personnelMap[row.personnel_id].skills.push({
          skill_id: row.skill_id,
          name: row.skill_name,
          proficiency: row.proficiency
        });
      }
    });

    // 4️⃣ Matching logic
    const results = [];

    Object.values(personnelMap).forEach(person => {
      let matched = 0;

      projectSkills.forEach(reqSkill => {
        const found = person.skills.find(
          s =>
            s.skill_id === reqSkill.skill_id &&
            LEVEL_WEIGHT[s.proficiency] >= LEVEL_WEIGHT[reqSkill.min_level]
        );
        if (found) matched++;
      });

      if (matched > 0) {
        results.push({
          personnelId: person.id,
          name: person.name,
          matchedSkills: matched,
          totalSkills: projectSkills.length,
          matchScore: Math.round((matched / projectSkills.length) * 100)
        });
      }
    });

    // 5️⃣ Best match first
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Matching failed" });
  }
};
