// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Users, Brain, Briefcase, Layers, Home } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProjectId(id);
    if (id) navigate(`/project-skills/${id}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white">
          <Layers size={26} />
          <span className="text-xl font-bold tracking-wide">SkillMatch Pro</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavItem to="/" icon={<Home size={18} />} label="Home" />
          <NavItem to="/personnel" icon={<Users size={18} />} label="Personnel" />
          <NavItem to="/skills" icon={<Brain size={18} />} label="Skills" />
          <NavItem to="/projects" icon={<Briefcase size={18} />} label="Projects" />

          {/* Project Skills Dropdown */}
          <select
            className="bg-white text-black rounded px-2 py-1"
            value={selectedProjectId}
            onChange={handleProjectChange}
          >
            <option value="">Project Skills</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </nav>
    </header>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg transition
       ${isActive
         ? "bg-white/20 text-white"
         : "text-blue-100 hover:bg-white/10 hover:text-white"}`
    }
  >
    {icon}
    {label}
  </NavLink>
);

export default Navbar;
