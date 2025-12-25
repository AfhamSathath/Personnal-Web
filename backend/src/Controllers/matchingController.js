import { db } from "../db.js";

const rank = { Beginner:1, Intermediate:2, Advanced:3, Expert:4 };

export const matchPersonnel = (req, res) => {
  const projectId = req.params.projectId;

  const sql = `
    SELECT p.name,p.role,s.name skill,ps.proficiency,pr.min_level
    FROM project_skills pr
    JOIN skills s ON pr.skill_id=s.id
    JOIN personnel_skills ps ON ps.skill_id=s.id
    JOIN personnel p ON p.id=ps.personnel_id
    WHERE pr.project_id=?
  `;

  db.query(sql,[projectId],(err,rows)=>{
    if(err) return res.status(500).json(err);

    const result = {};
    rows.forEach(r=>{
      if(rank[r.proficiency] >= rank[r.min_level]){
        if(!result[r.name]) result[r.name]={name:r.name,role:r.role,skills:[]};
        result[r.name].skills.push(`${r.skill} (${r.proficiency})`);
      }
    });

    res.json(Object.values(result));
  });
};
