import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Users, Brain, Briefcase, Layers , Home } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2 text-white">
          <Layers size={26} />
          <span className="text-xl font-bold tracking-wide">
            SkillMatch Pro
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavItem to= "/" icon={<Home size={18}/>} label="Home"/>
          <NavItem to="/personnel" icon={<Users size={18} />} label="Personnel" />
          <NavItem to="/skills" icon={<Brain size={18} />} label="Skills" />
          <NavItem to="/projects" icon={<Briefcase size={18} />} label="Projects" />
          <NavItem to="/projectsskills" icon={<Layers size={18} />} label="Project Skills" />
        </div>
      </nav>
    </header>
  );
};

/* ================= NAV ITEM ================= */

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
