import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API_PROJECTS = "http://localhost:5000/api/projects";
const API_SKILLS = "http://localhost:5000/api/skills";

const ProjectPage = () => {
  // ---------------- STATES ----------------
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

  // ---------------- FETCH DATA ----------------
  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_PROJECTS);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch projects");
    }
  };

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

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [
        ...formData.skills,
        { id: crypto.randomUUID(), skill_id: "", min_level: "Beginner" }
      ]
    });
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...formData.skills];
    updated[index][field] = value;
    setFormData({ ...formData, skills: updated });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...formData.skills];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setFormData({ ...formData, skills: items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axios.put(`${API_PROJECTS}/${editingId}`, formData);
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? res.data.project : p))
        );
        toast.success("Project updated");
      } else {
        const res = await axios.post(API_PROJECTS, formData);
        setProjects((prev) => [...prev, res.data.project]);
        toast.success("Project created");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project");
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "Planning",
      skills: []
    });
  };

  // ---------------- EDIT / DELETE ----------------
  const openEditModal = (project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date?.split("T")[0] || "",
      end_date: project.end_date?.split("T")[0] || "",
      status: project.status,
      skills:
        project.skills?.map((s) => ({
          id: crypto.randomUUID(),
          skill_id: s.skill_id,
          min_level: s.min_level
        })) || []
    });
    setIsModalOpen(true);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${API_PROJECTS}/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };

  // ---------------- FILTER / SORT ----------------
  const filteredProjects = useMemo(() => {
    let data = projects
      .filter((p) => !filterStatus || p.status === filterStatus)
      .filter(
        (p) =>
          !filterSkill ||
          p.skills?.some((s) => s.skill_id.toString() === filterSkill)
      )
      .filter((p) => {
        if (!searchText) return true;
        return p.name
          .toLowerCase()
          .startsWith(searchText.toLowerCase().slice(0, 3));
      });

    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? aVal.toString().localeCompare(bVal.toString())
          : bVal.toString().localeCompare(aVal.toString());
      });
    }

    return data;
  }, [projects, filterStatus, filterSkill, searchText, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // ---------------- RENDER ----------------
  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <button
          onClick={() => resetForm() || setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by first 3 letters..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Skills</option>
          {skillsList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["name", "status", "start_date", "end_date"].map((key) => (
                <th
                  key={key}
                  onClick={() => requestSort(key)}
                  className="px-4 py-2 cursor-pointer text-left font-semibold"
                >
                  {key.replace("_", " ").toUpperCase()}
                  {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
              <th className="px-4 py-2 text-left font-semibold">Skills</th>
              <th className="px-4 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProjects.length ? (
              filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2">{p.start_date?.split("T")[0]}</td>
                  <td className="px-4 py-2">{p.end_date?.split("T")[0]}</td>
                  <td className="px-4 py-2">
                    {p.skills?.map((s) => `${s.name} (${s.min_level})`).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="bg-yellow-400 text-white px-3 py-1 rounded"
                      onClick={() => openEditModal(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => deleteProject(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Project" : "Add Project"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Project Name"
                className="border p-2 w-full rounded"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="border p-2 w-full rounded"
                required
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="border p-2 w-1/2 rounded"
                />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="border p-2 w-1/2 rounded"
                />
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Skills Drag & Drop */}
              <h3 className="font-semibold">Skills (drag to reorder)</h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="skills">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {formData.skills.map((s, index) => (
                        <Draggable key={s.id} draggableId={s.id} index={index}>
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className="flex gap-2 items-center border p-2 rounded bg-gray-50 hover:bg-gray-100"
                            >
                              <select
                                value={s.skill_id}
                                onChange={(e) => handleSkillChange(index, "skill_id", e.target.value)}
                                className="border p-1 rounded flex-1"
                                required
                              >
                                <option value="">Select Skill</option>
                                {skillsList.map((sk) => (
                                  <option key={sk.id} value={sk.id}>
                                    {sk.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={s.min_level}
                                onChange={(e) => handleSkillChange(index, "min_level", e.target.value)}
                                className="border p-1 rounded"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                className="bg-red-500 text-white px-2 rounded"
                              >
                                X
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-3 py-1 rounded">
                Add Skill
              </button>

              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 mt-2">
                {editingId ? "Update Project" : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
