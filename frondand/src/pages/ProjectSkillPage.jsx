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
      
      // Normalize skill data to ensure consistent structure
      const skills = (res.data.skills || []).map(skill => ({
        skill_id: skill.skill_id || skill.id,
        skill_name: skill.skill_name || skill.name || "Unknown",
        min_level: skill.min_level || "Beginner",
        id: skill.skill_id || skill.id
      }));
      
      setProjectSkills(skills.sort((a, b) => a.skill_name.localeCompare(b.skill_name)));
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
  const isDuplicate = (skillId) => {
    return projectSkills.some((s) => s.skill_id === skillId || s.id === skillId);
  };

  // Add skill from dropdown
  const addSkill = () => {
    if (!selectedSkillId) {
      toast.error("Select a skill");
      return;
    }
    
    const skillId = parseInt(selectedSkillId);
    if (isDuplicate(skillId)) {
      toast.error("Skill already added");
      return;
    }

    const skillObj = allSkills.find((s) => s.id === skillId);
    if (!skillObj) {
      toast.error("Skill not found");
      return;
    }

    const newSkill = {
      skill_id: skillId,
      skill_name: skillObj.name,
      min_level: minLevel,
      id: skillId
    };

    const updatedSkills = [...projectSkills, newSkill].sort((a, b) => 
      a.skill_name.localeCompare(b.skill_name)
    );
    
    setProjectSkills(updatedSkills);
    setSelectedSkillId("");
    setMinLevel("Beginner");
  };

  // Remove skill
  const removeSkill = (skillId) => {
    setProjectSkills(projectSkills.filter((s) => 
      s.skill_id !== skillId && s.id !== skillId
    ));
  };

  // Update skill min_level
  const updateSkill = (skillId, level) => {
    const updated = projectSkills.map((s) =>
      (s.skill_id === skillId || s.id === skillId) ? { ...s, min_level: level } : s
    );
    setProjectSkills(updated);
  };

  // Prepare skills data for backend - ensure consistent format
  const prepareSkillsForBackend = () => {
    return projectSkills.map(skill => ({
      skill_id: skill.skill_id || skill.id,
      skill_name: skill.skill_name,
      min_level: skill.min_level
    }));
  };

  // Save project skills to backend
  const saveSkills = async () => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }
    
    if (projectSkills.length === 0) {
      toast.error("No skills to save");
      return;
    }
    
    try {
      const formattedSkills = prepareSkillsForBackend();
      
      await axios.put(`${API_PROJECTS}/${projectId}`, { 
        skills: formattedSkills 
      });
      toast.success("Project skills updated");
      setMatchedTeam([]);
      
      // Refresh project data to ensure consistency
      fetchProject();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save skills");
    }
  };

  // Match & deploy team - SIMPLIFIED VERSION
  const matchTeam = async () => {
    if (!project) {
      toast.error("Project not found");
      return;
    }
    
    if (projectSkills.length === 0) {
      toast.error("Add skills first before matching team");
      return;
    }
    
    setMatching(true);
    setMatchedTeam([]); // Clear previous results
    
    try {
      // First, ensure skills are saved to backend
      const formattedSkills = prepareSkillsForBackend();
      await axios.put(`${API_PROJECTS}/${projectId}`, { 
        skills: formattedSkills 
      });
      
      // Try to get matched team from backend (if endpoint exists)
      try {
        const res = await axios.get(`${API_PROJECTS}/${projectId}/match-team`);
        if (res.data && Array.isArray(res.data)) {
          setMatchedTeam(res.data);
          toast.success(`Matched ${res.data.length} team members successfully!`);
        } else {
          // If endpoint returns non-array or empty, use mock data
          useMockTeam();
        }
      } catch (endpointError) {
        console.log("Match team endpoint not available, using mock data");
        useMockTeam();
      }
      
    } catch (err) {
      console.error("Match team error:", err);
      toast.error("Failed to save skills before matching");
      useMockTeam();
    } finally {
      setMatching(false);
    }
  };

  // Use mock team data (for development/demo)
  const useMockTeam = () => {
    const levelScores = {
      "Beginner": 1,
      "Intermediate": 2,
      "Advanced": 3,
      "Expert": 4
    };
    
    // Get required skill names
    const requiredSkills = projectSkills.map(s => s.skill_name);
    
    if (requiredSkills.length === 0) {
      toast.info("Add skills to see team matches");
      return;
    }
    
    // Generate mock team members based on required skills
    const mockMembers = [
      {
        id: 1,
        name: "Raja",
        skills: requiredSkills.length > 0 ? [requiredSkills[0]] : ["React"],
        score: levelScores[projectSkills[0]?.min_level || "Beginner"] || 3
      },
      {
        id: 2,
        name: "Ravi",
        skills: requiredSkills.length > 0 ? [requiredSkills[0]] : ["React"],
        score: levelScores[projectSkills[0]?.min_level || "Beginner"] || 3
      }
    ];
    
    // Add more team members if we have multiple skills
    if (requiredSkills.length > 1) {
      mockMembers.push({
        id: 3,
        name: "Priya",
        skills: requiredSkills.slice(0, 2),
        score: Math.max(...projectSkills.map(s => levelScores[s.min_level] || 1)) || 3
      });
      
      mockMembers.push({
        id: 4,
        name: "Ankit",
        skills: requiredSkills,
        score: Math.max(...projectSkills.map(s => levelScores[s.min_level] || 1)) + 1 || 4
      });
    }
    
    setMatchedTeam(mockMembers);
    toast.info(`Demo: Showing ${mockMembers.length} mock team members`);
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
          {projectSkills.length === 0 ? (
            <tr>
              <td colSpan="3" className="border p-2 text-center text-gray-500">
                No skills added yet. Add skills to match team members.
              </td>
            </tr>
          ) : (
            projectSkills.map((skill) => (
              <tr key={skill.skill_id || skill.id}>
                <td className="border p-2">{skill.skill_name}</td>
                <td className="border p-2">
                  <select
                    value={skill.min_level}
                    onChange={(e) => updateSkill(skill.skill_id || skill.id, e.target.value)}
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
                    onClick={() => removeSkill(skill.skill_id || skill.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Skills Summary */}
      {projectSkills.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Required Skills:</strong> {projectSkills.map(s => s.skill_name).join(", ")}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Minimum Levels:</strong> {projectSkills.map(s => `${s.skill_name}: ${s.min_level}`).join(", ")}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={saveSkills}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          disabled={projectSkills.length === 0}
        >
          Save Skills
        </button>
        <button
          onClick={matchTeam}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          disabled={matching || projectSkills.length === 0}
        >
          {matching ? "Matching Team..." : "Match & Deploy Team"}
        </button>
      </div>

      {/* Matched Team */}
      {matchedTeam.length > 0 && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Matched Team</h2>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Skills</th>
                  <th className="border p-2 text-left">Match Score</th>
                </tr>
              </thead>
              <tbody>
                {matchedTeam.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-100">
                    <td className="border p-2 font-medium">{person.name}</td>
                    <td className="border p-2">
                      {Array.isArray(person.skills) 
                        ? person.skills.join(", ") 
                        : person.skills || "No skills listed"}
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-white ${
                        person.score >= 4 ? "bg-green-500" :
                        person.score >= 3 ? "bg-blue-500" :
                        person.score >= 2 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}>
                        {person.score || 0}/5
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Total matched: {matchedTeam.length} team member(s)</p>
            <p className="mt-1">
              <strong>Score Legend:</strong> 
              <span className="ml-2"><span className="inline-block w-3 h-3 bg-green-500 mr-1"></span>Expert (4-5)</span>
              <span className="ml-2"><span className="inline-block w-3 h-3 bg-blue-500 mr-1"></span>Advanced (3)</span>
              <span className="ml-2"><span className="inline-block w-3 h-3 bg-yellow-500 mr-1"></span>Intermediate (2)</span>
              <span className="ml-2"><span className="inline-block w-3 h-3 bg-red-500 mr-1"></span>Beginner (1)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSkillPage;