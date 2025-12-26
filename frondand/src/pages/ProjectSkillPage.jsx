// src/pages/ProjectSkillPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/projects"; // backend project routes

const ProjectSkillPage = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_name: "", min_level: "Beginner" });

  // --- Fetch Project & Skills ---
  const fetchProject = async () => {
    try {
      const res = await axios.get(`${API_URL}/${projectId}`);
      setProject(res.data);
      setSkills(res.data.skills || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch project");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // --- Handle Skill Input ---
  const handleChange = (e) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
  };

  // --- Add Skill ---
  const addSkill = () => {
    if (!newSkill.skill_name) return toast.error("Skill name is required");
    setSkills([...skills, newSkill]);
    setNewSkill({ skill_name: "", min_level: "Beginner" });
  };

  // --- Remove Skill ---
  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // --- Save Skills to Backend ---
  const saveSkills = async () => {
    try {
      await axios.put(`${API_URL}/${projectId}`, { skills });
      toast.success("Skills updated successfully");
      fetchProject(); // refresh
    } catch (error) {
      console.error(error);
      toast.error("Failed to update skills");
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Manage Skills for "{project.name}"</h1>

      <div className="mb-4">
        <input
          type="text"
          name="skill_name"
          placeholder="Skill Name"
          value={newSkill.skill_name}
          onChange={handleChange}
          className="border p-2 mr-2"
        />
        <select name="min_level" value={newSkill.min_level} onChange={handleChange} className="border p-2 mr-2">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        <button onClick={addSkill} className="bg-blue-500 text-white px-4 py-2 rounded">Add Skill</button>
      </div>

      <table className="border w-full mb-4">
        <thead>
          <tr>
            <th className="border p-2">Skill</th>
            <th className="border p-2">Min Level</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill, index) => (
            <tr key={index}>
              <td className="border p-2">{skill.skill_name}</td>
              <td className="border p-2">{skill.min_level}</td>
              <td className="border p-2">
                <button onClick={() => removeSkill(index)} className="bg-red-500 text-white px-2 rounded">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={saveSkills} className="bg-green-500 text-white px-4 py-2 rounded">Save Skills</button>
    </div>
  );
};

export default ProjectSkillPage;
