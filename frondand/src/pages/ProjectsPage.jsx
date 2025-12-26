// src/pages/ProjectPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/projects";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planning",
    skills: []
  });
  const [editingId, setEditingId] = useState(null);

  // --- FETCH ALL PROJECTS ---
  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_URL);
      setProjects(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- HANDLE INPUT CHANGE ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ADD SKILL ---
  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, { skill_name: "", min_level: "Beginner" }] });
  };

  // --- HANDLE SKILL CHANGE ---
  const handleSkillChange = (index, e) => {
    const newSkills = [...formData.skills];
    newSkills[index][e.target.name] = e.target.value;
    setFormData({ ...formData, skills: newSkills });
  };

  // --- REMOVE SKILL ---
  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  // --- SUBMIT PROJECT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        toast.success("Project updated");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Project created");
      }
      setFormData({ name: "", description: "", start_date: "", end_date: "", status: "Planning", skills: [] });
      setEditingId(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save project");
    }
  };

  // --- EDIT PROJECT ---
  const editProject = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date?.split("T")[0],
      end_date: project.end_date?.split("T")[0],
      status: project.status,
      skills: project.skills || []
    });
    setEditingId(project.id);
  };

  // --- DELETE PROJECT ---
  const deleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Project deleted");
        fetchProjects();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete project");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">{editingId ? "Edit Project" : "Add Project"}</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input name="name" placeholder="Project Name" value={formData.name} onChange={handleChange} className="border p-2 w-full" required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 w-full" required />
        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="border p-2 w-full" />
        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="border p-2 w-full" />
        <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full">
          <option value="Planning">Planning</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>

        <h3 className="mt-2 font-semibold">Skills</h3>
        {formData.skills.map((skill, index) => (
          <div key={index} className="flex gap-2 mb-1">
            <input
              name="skill_name"
              placeholder="Skill Name"
              value={skill.skill_name}
              onChange={(e) => handleSkillChange(index, e)}
              className="border p-1 flex-1"
            />
            <select
              name="min_level"
              value={skill.min_level}
              onChange={(e) => handleSkillChange(index, e)}
              className="border p-1"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button type="button" onClick={() => removeSkill(index)} className="bg-red-500 text-white px-2 rounded">X</button>
          </div>
        ))}
        <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-3 py-1 rounded">Add Skill</button>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mt-2">
          {editingId ? "Update Project" : "Create Project"}
        </button>
      </form>

      <h2 className="text-xl font-bold mb-2">Projects List</h2>
      <table className="border w-full">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Start Date</th>
            <th className="border p-2">End Date</th>
            <th className="border p-2">Skills</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="border p-2">{project.name}</td>
              <td className="border p-2">{project.status}</td>
              <td className="border p-2">{project.start_date?.split("T")[0]}</td>
              <td className="border p-2">{project.end_date?.split("T")[0]}</td>
              <td className="border p-2">{project.skills?.map(s => s.skill_name).join(", ")}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => editProject(project)} className="bg-yellow-400 px-2 rounded">Edit</button>
                <button onClick={() => deleteProject(project.id)} className="bg-red-500 text-white px-2 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectPage;
