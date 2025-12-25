import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white flex gap-4">
      <Link to="/">Home</Link>
      <Link to="/personnel">Personnel</Link>
      <Link to="/skills">Skills</Link>
      
    </nav>
  );
};

export default Navbar;
