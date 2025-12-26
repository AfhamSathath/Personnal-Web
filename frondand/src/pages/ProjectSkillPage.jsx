// src/pages/ProjectSkillPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_PROJECTS = "http://localhost:5000/api/projects";
const API_SKILLS = "http://localhost:5000/api/skills";

const ProjectSkillPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [projectSkills, setProjectSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [minLevel, setMinLevel] = useState("Beginner");
  const [loading, setLoading] = useState(true);
  const [matchedTeam, setMatchedTeam] = useState([]);
  const [matching, setMatching] = useState(false);

  // Fetch all skills from skills table
  const fetchAllSkills = async () => {
    try {
      const res = await axios.get(API_SKILLS);
      setAllSkills(res.data);
    } catch (err) {
      console.error("Failed to fetch skills", err);
      toast.error("Failed to fetch all skills");
    }
  };

  // Fetch project and its assigned skills
  const fetchProject = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_PROJECTS}/${projectId}`);
      setProject(res.data);
      setProjectSkills((res.data.skills || []).sort((a, b) => a.skill_name.localeCompare(b.skill_name)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSkills();
    fetchProject();
  }, [projectId]);

  // Check for duplicate
  const isDuplicate = (skillId) => projectSkills.some((s) => s.skill_id === skillId);

  // Add skill from dropdown
  const addSkill = () => {
    if (!selectedSkillId) return toast.error("Select a skill");
    if (isDuplicate(selectedSkillId)) return toast.error("Skill already added");

    const skillObj = allSkills.find((s) => s.id === parseInt(selectedSkillId));
    const newSkill = { skill_id: skillObj.id, skill_name: skillObj.name, min_level: minLevel };

    setProjectSkills([...projectSkills, newSkill].sort((a, b) => a.skill_name.localeCompare(b.skill_name)));
    setSelectedSkillId("");
    setMinLevel("Beginner");
  };

  // Remove skill
  const removeSkill = (skillId) => setProjectSkills(projectSkills.filter((s) => s.skill_id !== skillId));

  // Update skill min_level
  const updateSkill = (skillId, level) => {
    const updated = projectSkills.map((s) =>
      s.skill_id === skillId ? { ...s, min_level: level } : s
    );
    setProjectSkills(updated);
  };

  // Save project skills to backend
  const saveSkills = async () => {
    try {
      await axios.put(`${API_PROJECTS}/${projectId}`, { skills: projectSkills });
      toast.success("Project skills updated");
      setMatchedTeam([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save skills");
    }
  };

  // Match & deploy team
  const matchTeam = async () => {
    if (!project) return;
    setMatching(true);
    try {
      const res = await axios.get(`${API_PROJECTS}/${projectId}/match-team`);
      setMatchedTeam(res.data);
      toast.success("Best team matched successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to match team");
    } finally {
      setMatching(false);
    }
  };

  if (!projectId) return <div className="p-4 text-center text-red-500">Project ID not specified</div>;
  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!project) return <div className="p-4 text-center text-red-500">Project not found</div>;

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Manage Skills for "{project.name}"</h1>

      {/* Add Skill */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <select
          value={selectedSkillId}
          onChange={(e) => setSelectedSkillId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Skill</option>
          {allSkills.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={minLevel}
          onChange={(e) => setMinLevel(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>

        <button
          onClick={addSkill}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Skill
        </button>
      </div>

      {/* Skills Table */}
      <table className="border w-full mb-4 table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Skill</th>
            <th className="border p-2 text-left">Min Level</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {projectSkills.map((skill) => (
            <tr key={skill.skill_id}>
              <td className="border p-2">{skill.skill_name}</td>
              <td className="border p-2">
                <select
                  value={skill.min_level}
                  onChange={(e) => updateSkill(skill.skill_id, e.target.value)}
                  className="border p-1 w-full rounded"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => removeSkill(skill.skill_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={saveSkills}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Skills
        </button>
        <button
          onClick={matchTeam}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          disabled={matching}
        >
          {matching ? "Matching..." : "Match & Deploy Team"}
        </button>
      </div>

      {/* Matched Team */}
      {matchedTeam.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Matched Team</h2>
          <ul className="list-disc pl-5">
            {matchedTeam.map((person) => (
              <li key={person.id}>
                {person.name} — Skills: {person.skills.join(", ")} — Score: {person.score}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectSkillPage;
