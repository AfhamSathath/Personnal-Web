import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/personnel";

const PersonnelPage = () => {
    const [personnel, setPersonnel] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [filterRole, setFilterRole] = useState(""); // 🔹 Filter state

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
            if (err.response?.status === 409) {
                toast.error("Email already exists.");
            } else {
                toast.error("Failed to save personnel.");
            }
        }
    };

    const handleEdit = (p) => {
        setEditingId(p.id);
        setFormData({
            name: p.name,
            email: p.email,
            role: p.role,
            experience: p.experience,
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "",
            email: "",
            role: "",
            experience: "Junior",
        });
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

    // 🔹 Filtered personnel
    const filteredPersonnel = filterRole
        ? personnel.filter((p) => p.role === filterRole)
        : personnel;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-3xl font-bold mb-6">Personnel Management</h1>

            {/* 🔹 FORM */}
            <form
                onSubmit={handleSubmit}
                className="mb-6 p-4 border rounded bg-gray-50 space-y-4"
            >
                <h2 className="text-xl font-semibold">
                    {editingId ? "Update Personnel" : "Add New Personnel"}
                </h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select Role</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="QA Engineer">QA Engineer</option>
                </select>

                <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                </select>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {editingId ? "Update Personnel" : "Add Personnel"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* 🔹 ROLE FILTER */}
            <div className="mb-4">
                <label className="mr-2 font-semibold">Filter by Role:</label>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All Roles</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="QA Engineer">QA Engineer</option>
                </select>
            </div>

            {/* 🔹 LIST */}
            <ul className="space-y-3">
                {filteredPersonnel.length === 0 ? (
                    <li className="text-gray-500">No personnel found.</li>
                ) : (
                    filteredPersonnel.map((p) => (
                        <li
                            key={p.id}
                            className={`border p-3 rounded flex justify-between items-center
                                ${editingId === p.id ? "bg-yellow-50 border-yellow-400" : ""}`}
                        >
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-sm text-gray-600">
                                    {p.role} — {p.experience}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(p.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default PersonnelPage;
