import { projectModel } from "../models/projectModel.js";
import { db } from "../db.js"; 


// GET ALL PROJECTS

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAll();
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};


// GET PROJECT BY ID

export const getProjectById = async (req, res) => {
  try {
    const project = await projectModel.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch skills for the project
    const [skills] = await db.query(
      `SELECT s.id AS skill_id, s.name AS skill_name, ps.min_level
       FROM project_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.project_id = ?`,
      [req.params.id]
    );

    res.json({ ...project, skills });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
};


// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { name, description, start_date, end_date, status, skills } = req.body;

    const projectId = await projectModel.create({ name, description, start_date, end_date, status, skills });

    // Optionally, insert skills into project_skills table
    if (skills && skills.length > 0) {
      for (const skill of skills) {
        await db.query(
          `INSERT INTO project_skills (project_id, skill_id, min_level) VALUES (?, ?, ?)`,
          [projectId, skill.skill_id, skill.min_level]
        );
      }
    }

    const project = await projectModel.getById(projectId);
    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
};


// UPDATE PROJECT

export const updateProject = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, start_date, end_date, status, skills } = req.body;

    await projectModel.update(id, { name, description, start_date, end_date, status, skills });

    // Update project skills
    if (skills) {
      await db.query(`DELETE FROM project_skills WHERE project_id = ?`, [id]);
      for (const skill of skills) {
        await db.query(
          `INSERT INTO project_skills (project_id, skill_id, min_level) VALUES (?, ?, ?)`,
          [id, skill.skill_id, skill.min_level]
        );
      }
    }

    const project = await projectModel.getById(id);
    res.json({ message: "Project updated", project });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};


// DELETE PROJECT

export const deleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    await projectModel.delete(id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
};


// MATCH & DEPLOY TEAM

export const matchTeamForProject = async (req, res) => {
  const { id: projectId } = req.params;

  try {
    // Get required skills for the project
    const [projectSkills] = await db.query(
      `SELECT ps.skill_id, ps.min_level, s.name AS skill_name
       FROM project_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.project_id = ?`,
      [projectId]
    );

    if (!projectSkills.length) {
      return res.status(400).json({ message: "Project has no skills defined." });
    }

    //  Get all personnel with their skills
    const [personnelSkills] = await db.query(
      `SELECT p.id AS personnel_id, p.name AS personnel_name,
              s.id AS skill_id, s.name AS skill_name, ps.proficiency
       FROM personnel_skills ps
       JOIN personnel p ON ps.personnel_id = p.id
       JOIN skills s ON ps.skill_id = s.id`
    );

    // Matching algorithm
    const levels = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
    const personnelMap = {};

    personnelSkills.forEach(ps => {
      if (!personnelMap[ps.personnel_id]) {
        personnelMap[ps.personnel_id] = { id: ps.personnel_id, name: ps.personnel_name, score: 0, skills: [] };
      }
      const skillMatch = projectSkills.find(sk => sk.skill_id === ps.skill_id);
      if (skillMatch) {
        const minLevelWeight = levels[skillMatch.min_level] || 1;
        const profWeight = levels[ps.proficiency] || 1;
        if (profWeight >= minLevelWeight) {
          personnelMap[ps.personnel_id].score += profWeight;
          personnelMap[ps.personnel_id].skills.push(ps.skill_name);
        }
      }
    });

    // Sort personnel by score descending
    const matchedPersonnel = Object.values(personnelMap)
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json(matchedPersonnel);

  } catch (error) {
    console.error("Error matching team:", error);
    res.status(500).json({ message: "Failed to match team." });
  }
};
