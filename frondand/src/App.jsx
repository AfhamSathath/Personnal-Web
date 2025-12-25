import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PersonnelPage from "./pages/PersonnelPage";
import SkillsPage from "./pages/SkillsPage";
import MatchPage from "./pages/MatchPage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/match" element={<MatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}
