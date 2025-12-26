// src/controllers/projectController.js
import { projectModel } from "../models/projectModel.js";

// --- GET ALL PROJECTS ---
export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAll();
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// --- GET PROJECT BY ID ---
export const getProjectById = async (req, res) => {
  try {
    const project = await projectModel.getById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const skills = await projectModel.getSkills(project.id);
    res.json({ ...project, skills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

// --- CREATE PROJECT ---
export const createProject = async (req, res) => {
  try {
    const { name, description, start_date, end_date, status, skills } = req.body;
    const projectId = await projectModel.create({ name, description, start_date, end_date, status, skills });
    res.status(201).json({ message: "Project created", projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating project" });
  }
};

// --- UPDATE PROJECT ---
export const updateProject = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, start_date, end_date, status, skills } = req.body;
    await projectModel.update(id, { name, description, start_date, end_date, status, skills });
    res.json({ message: "Project updated", projectId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating project" });
  }
};

// --- DELETE PROJECT ---
export const deleteProject = async (req, res) => {
  try {
    await projectModel.delete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting project" });
  }
};
