import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2, Search } from "lucide-react";

const API_URL = "http://localhost:5000/api/personnel";

const PersonnelPage = () => {
  const [personnel, setPersonnel] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filterRole, setFilterRole] = useState("");
  const [filterLevel, setFilterLevel] = useState(""); // 🔹 Level filter
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    experience: "Junior",
  });

  const fetchPersonnel = async () => {
    try {
      const res = await axios.get(API_URL);
      setPersonnel(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch personnel.");
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        toast.success("Personnel updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Personnel added successfully!");
      }
      resetForm();
      fetchPersonnel();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.status === 409 ? "Email already exists." : "Failed to save personnel.");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({ name: p.name, email: p.email, role: p.role, experience: p.experience });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", role: "", experience: "Junior" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this personnel?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Personnel deleted successfully!");
      if (editingId === id) resetForm();
      fetchPersonnel();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete personnel.");
    }
  };

  // 🔹 Filter + Search + Level
  const filteredPersonnel = useMemo(() => {
    return personnel
      .filter((p) => (!filterRole || p.role === filterRole) && (!filterLevel || p.experience === filterLevel))
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.email.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [personnel, filterRole, filterLevel, searchText]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(filteredPersonnel);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setPersonnel(items);
  };

  const roleColors = {
    "Frontend Developer": "bg-blue-100 text-blue-800",
    "Backend Developer": "bg-green-100 text-green-800",
    "Fullstack Developer": "bg-purple-100 text-purple-800",
    Designer: "bg-pink-100 text-pink-800",
    "Project Manager": "bg-yellow-100 text-yellow-800",
    "QA Engineer": "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Personnel Management</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4 transition-all hover:shadow-xl"
      >
        <h2 className="text-2xl font-semibold text-gray-800">{editingId ? "Update Personnel" : "Add New Personnel"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Role</option>
            {Object.keys(roleColors).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Junior">Junior</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end">
          {editingId && (
            <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-700 font-semibold transition">
              Cancel
            </button>
          )}
          <button type="submit" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
            {editingId ? "Update" : "Add Personnel"}
          </button>
        </div>
      </form>

      {/* FILTER + SEARCH */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        {/* Role filter */}
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700">Filter by Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            {Object.keys(roleColors).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700">Filter by Level:</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Levels</option>
            <option value="Junior">Junior</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 flex-1 md:justify-end">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-64"
          />
        </div>
      </div>

      {/* PERSONNEL LIST - DRAG AND DROP */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="personnelList">
          {(provided) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" {...provided.droppableProps} ref={provided.innerRef}>
              {filteredPersonnel.length === 0 ? (
                <p className="text-gray-500 text-center col-span-full">No personnel found.</p>
              ) : (
                filteredPersonnel.map((p, index) => (
                  <Draggable key={p.id} draggableId={p.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col justify-between transition-all hover:shadow-xl ${
                          editingId === p.id ? "border-yellow-400 bg-yellow-50" : ""
                        }`}
                      >
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
                          <p className="text-gray-600">{p.email}</p>
                          <p className="mt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${roleColors[p.role]}`}>{p.role}</span>
                            <span className="text-gray-500 ml-2">{p.experience}</span>
                          </p>
                          <p className="text-gray-400 text-xs mt-1">Created: {new Date(p.created_at).toLocaleString()}</p>
                        </div>

                        <div className="flex gap-2 justify-end mt-2">
                          <button onClick={() => handleEdit(p)} className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                            <Pencil size={16} /> Edit
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default PersonnelPage;
