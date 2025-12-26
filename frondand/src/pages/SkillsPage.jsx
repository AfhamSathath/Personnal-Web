import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Card from "../components/Card";

const API_SKILLS = "http://localhost:5000/api/skills";
const API_PERSONNEL = "http://localhost:5000/api/personnel";
const API_ASSIGN = "http://localhost:5000/api/personnel-skills";

const PROFICIENCY_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const SKILL_CATEGORIES = ["Programming Language","Framework","Tool","Soft Skill"];
const COMMON_SKILLS = ["React","Python","AWS","Node.js","Java","Docker"];

export default function SkillsPage() {
  const [skills,setSkills] = useState([]);
  const [personnel,setPersonnel] = useState([]);
  const [editingId,setEditingId] = useState(null);
  const [form,setForm] = useState({name:"",category:"",description:""});
  const [assignForm,setAssignForm] = useState({personnelId:"",skillId:"",proficiency:"Beginner"});

  // 🔹 Filters & live search
  const [searchName, setSearchName] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const fetchSkills = useCallback(async()=>{
    try{const res=await axios.get(API_SKILLS); setSkills(res.data);} 
    catch(err){console.error("Failed to fetch skills:",err);}
  },[]);

  const fetchPersonnel = useCallback(async()=>{
    try{const res=await axios.get(API_PERSONNEL); setPersonnel(res.data);} 
    catch(err){console.error("Failed to fetch personnel:",err);}
  },[]);

  useEffect(()=>{fetchSkills(); fetchPersonnel();},[fetchSkills,fetchPersonnel]);

  const resetSkillForm=()=>{setForm({name:"",category:"",description:""}); setEditingId(null);};

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!form.name || !form.category) return alert("Name and category required.");
    try{
      if(editingId){await axios.put(`${API_SKILLS}/${editingId}`,form); alert("Skill updated!");}
      else{await axios.post(API_SKILLS,form); alert("Skill added!");}
      resetSkillForm(); fetchSkills();
    } catch(err){console.error(err); alert(err.response?.data?.message||"Server error");}
  };

  const handleEdit=(skill)=>{setEditingId(skill.id); setForm({name:skill.name, category:skill.category, description:skill.description||""});};
  const handleDelete=async(id)=>{if(!window.confirm("Delete?"))return; try{await axios.delete(`${API_SKILLS}/${id}`); fetchSkills();}catch(err){console.error(err); alert("Delete failed");}};

  const handleAssign=async(e)=>{
    e.preventDefault();
    const personnelId=Number(assignForm.personnelId);
    const skillId=Number(assignForm.skillId);
    if(!personnelId || !skillId) return alert("Select valid personnel & skill.");
    try{
      await axios.post(API_ASSIGN,{personnelId,skillId,proficiency:assignForm.proficiency});
      setAssignForm({personnelId:"",skillId:"",proficiency:"Beginner"});
      fetchPersonnel(); fetchSkills();
    } catch(err){console.error(err); alert(err.response?.data?.message||"Assign failed");}
  };

  // 🔹 Filtered personnel (live search + proficiency)
  const filteredPersonnel = personnel.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(searchName.toLowerCase());
    const skillMatch = searchSkill ? (p.skills||[]).some(s => s.name.toLowerCase().includes(searchSkill.toLowerCase())) : true;
    const levelMatch = filterLevel ? (p.skills||[]).some(s => s.proficiency === filterLevel) : true;
    return nameMatch && skillMatch && levelMatch;
  });

  return(
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* 🔹 Skill Catalog */}
      <Card title="Skill Catalog">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 mb-6">
          <input list="skill-options" className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Skill Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <datalist id="skill-options">{COMMON_SKILLS.map(s=><option key={s} value={s}/>)}</datalist>
          <select className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required>
            <option value="">Select Category</option>{SKILL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <input className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <div className="md:col-span-3 flex gap-3 mt-2">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition"> {editingId?"Update Skill":"Add Skill"} </button>
            {editingId && <button type="button" onClick={resetSkillForm} className="bg-gray-400 text-white px-4 rounded-lg shadow hover:bg-gray-500 transition">Cancel</button>}
          </div>
        </form>
        <ul className="grid md:grid-cols-2 gap-4">
          {skills.map(s=>(
            <li key={s.id} className="p-4 bg-white border rounded-xl shadow hover:shadow-lg transition flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{s.name}</p>
                <p className="text-sm text-gray-500">{s.category}</p>
                {s.description && <p className="text-sm text-gray-400 mt-1">{s.description}</p>}
              </div>
              <div className="flex gap-3 mt-1">
                <button onClick={()=>handleEdit(s)} className="text-blue-600 text-sm font-medium hover:underline">Edit</button>
                <button onClick={()=>handleDelete(s.id)} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* 🔹 Assign Skills */}
      <Card title="Assign Skill to Personnel">
        <form onSubmit={handleAssign} className="grid md:grid-cols-4 gap-4">
          <select className="border p-3 rounded-lg shadow focus:ring-2 focus:ring-green-400" value={assignForm.personnelId} onChange={e=>setAssignForm({...assignForm,personnelId:e.target.value})}>
            <option value="">Select Personnel</option>{personnel.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="border p-3 rounded-lg shadow focus:ring-2 focus:ring-green-400" value={assignForm.skillId} onChange={e=>setAssignForm({...assignForm,skillId:e.target.value})}>
            <option value="">Select Skill</option>{skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="border p-3 rounded-lg shadow focus:ring-2 focus:ring-green-400" value={assignForm.proficiency} onChange={e=>setAssignForm({...assignForm,proficiency:e.target.value})}>
            {PROFICIENCY_LEVELS.map(lvl=><option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:from-green-600 hover:to-green-700 transition">Assign</button>
        </form>
      </Card>

      {/* 🔹 Personnel & Skills */}
      <Card title="Personnel & Assigned Skills">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input type="text" placeholder="Search personnel..." value={searchName} onChange={e=>setSearchName(e.target.value)} className="p-2 border rounded-lg shadow w-64 focus:ring-2 focus:ring-blue-400"/>
          <input type="text" placeholder="Search skill..." value={searchSkill} onChange={e=>setSearchSkill(e.target.value)} className="p-2 border rounded-lg shadow w-64 focus:ring-2 focus:ring-green-400"/>
          <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="p-2 border rounded-lg shadow">
            <option value="">All Levels</option>
            {PROFICIENCY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <button type="button" onClick={()=>{setSearchName(""); setSearchSkill(""); setFilterLevel("");}} className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition">Clear Filters</button>
        </div>

        <ul className="grid md:grid-cols-2 gap-4">
          {filteredPersonnel.length===0 ? (
            <li className="text-gray-500 text-center col-span-2">No personnel found.</li>
          ) : filteredPersonnel.map(p=>(
            <li key={p.id} className="border p-4 rounded-xl shadow hover:shadow-lg transition bg-white">
              <p className="font-semibold text-lg">{p.name}</p>
              <p className="text-sm text-gray-600">{p.role||"—"} — {p.experience||"—"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(p.skills||[]).map(s=>(
                  <span key={s.id} className={`px-2 py-1 rounded-full text-xs font-medium
                    ${s.proficiency==="Beginner"?"bg-blue-100 text-blue-800":
                      s.proficiency==="Intermediate"?"bg-yellow-100 text-yellow-800":
                      s.proficiency==="Advanced"?"bg-purple-100 text-purple-800":
                      "bg-green-100 text-green-800"}`}>
                    {s.name} ({s.proficiency})
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
