import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API_PROJECTS = "http://localhost:5000/api/projects";
const API_SKILLS = "http://localhost:5000/api/skills";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planning",
    skills: []
  });
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_PROJECTS);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch projects");
    }
  };

  // Fetch skills
  const fetchSkills = async () => {
    try {
      const res = await axios.get(API_SKILLS);
      setSkillsList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch skills");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchSkills();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...formData.skills];
    newSkills[index][field] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, { skill_id: "", min_level: "Beginner" }] });
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.skills);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setFormData({ ...formData, skills: items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axios.put(`${API_PROJECTS}/${editingId}`, formData);
        toast.success("Project updated");
        setProjects(prev => prev.map(p => p.id === editingId ? res.data.project : p));
      } else {
        const res = await axios.post(API_PROJECTS, formData);
        toast.success("Project created");
        setProjects(prev => [...prev, res.data.project]);
      }
      setFormData({ name: "", description: "", start_date: "", end_date: "", status: "Planning", skills: [] });
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project");
    }
  };

  const openEditModal = (project) => {
    if (!window.confirm(`Do you want to edit the project "${project.name}"?`)) return;
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date?.split("T")[0] || "",
      end_date: project.end_date?.split("T")[0] || "",
      status: project.status,
      skills: project.skills?.map(s => ({ skill_id: s.skill_id, min_level: s.min_level })) || []
    });
    setEditingId(project.id);
    setIsModalOpen(true);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${API_PROJECTS}/${id}`);
      toast.success("Project deleted");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };

  const filteredProjects = useMemo(() => {
    let data = projects
      .filter(p => !filterStatus || p.status === filterStatus)
      .filter(p => !filterSkill || p.skills?.some(s => s.skill_id.toString() === filterSkill))
      .filter(p => {
        if (!searchText) return true;
        return p.name.toLowerCase().startsWith(searchText.toLowerCase().slice(0, 3));
      });

    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [projects, filterStatus, filterSkill, searchText, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
        <button
          onClick={() => { setEditingId(null); setFormData({ name: "", description: "", start_date: "", end_date: "", status: "Planning", skills: [] }); setIsModalOpen(true); }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          + Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by first 3 letters of name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded">
          <option value="">All Status</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} className="border p-2 rounded">
          <option value="">All Skills</option>
          {skillsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => requestSort("name")} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer">
                Name {getSortIndicator("name")}
              </th>
              <th onClick={() => requestSort("status")} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer">
                Status {getSortIndicator("status")}
              </th>
              <th onClick={() => requestSort("start_date")} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer">
                Start Date {getSortIndicator("start_date")}
              </th>
              <th onClick={() => requestSort("end_date")} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer">
                End Date {getSortIndicator("end_date")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skills</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                {/* Name with first 3 letters highlight */}
                <td className="px-4 py-2 text-gray-800 font-medium">
                  {searchText && project.name.toLowerCase().startsWith(searchText.toLowerCase().slice(0, 3)) ? (
                    <>
                      <span className="bg-yellow-200">{project.name.slice(0, 3)}</span>
                      {project.name.slice(3)}
                    </>
                  ) : (
                    project.name
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === "Planning" ? "bg-yellow-100 text-yellow-800" :
                      project.status === "Active" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                    }`}>{project.status}</span>
                </td>
                <td className="px-4 py-2 text-gray-600">{project.start_date?.split("T")[0]}</td>
                <td className="px-4 py-2 text-gray-600">{project.end_date?.split("T")[0]}</td>
                <td className="px-4 py-2 text-gray-600 max-w-xs truncate" title={project.skills?.map(s => s.name).join(", ")}>
                  {project.skills?.map(s => s.name).join(", ") || "No skills"}
                </td>

                <td className="px-4 py-2 text-gray-600 max-w-xs truncate" title={project.skills?.map(s => `${s.name} (${s.min_level})`).join(", ")}>
                  {project.skills?.map(s => `${s.name} (${s.min_level})`).join(", ") || "No skills"}
                </td>


                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => openEditModal(project)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition">Edit</button>
                  <button onClick={() => deleteProject(project.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-4">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg">&times;</button>
            <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Project" : "Add Project"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" placeholder="Project Name" value={formData.name} onChange={handleChange} className="border p-2 w-full rounded" required />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 w-full rounded" required />
              <div className="flex gap-2">
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="border p-2 w-1/2 rounded" />
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="border p-2 w-1/2 rounded" />
              </div>
              <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full rounded">
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>

              <h3 className="font-semibold">Skills (Drag to reorder)</h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="skillsList">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {formData.skills.map((skill, index) => (
                        <Draggable key={index} draggableId={index.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex gap-2 items-center border p-2 rounded bg-gray-50 hover:bg-gray-100"
                            >
                              <select value={skill.skill_id} onChange={(e) => handleSkillChange(index, "skill_id", e.target.value)} className="border p-1 flex-1 rounded" required>
                                <option value="">Select Skill</option>
                                {skillsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <select value={skill.min_level} onChange={(e) => handleSkillChange(index, "min_level", e.target.value)} className="border p-1 rounded">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                              <button type="button" onClick={() => removeSkill(index)} className="bg-red-500 text-white px-2 rounded">X</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-3 py-1 rounded">Add Skill</button>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600 transition">{editingId ? "Update Project" : "Create Project"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
