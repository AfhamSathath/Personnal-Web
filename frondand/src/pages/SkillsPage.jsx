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

  return(
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <Card title="Skill Catalog">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 mb-6">
          <input list="skill-options" className="border p-2 rounded w-full" placeholder="Skill Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <datalist id="skill-options">{COMMON_SKILLS.map(s=><option key={s} value={s}/>)}</datalist>
          <select className="border p-2 rounded w-full" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required>
            <option value="">Select Category</option>{SKILL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <input className="border p-2 rounded w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <div className="md:col-span-3 flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{editingId?"Update Skill":"Add Skill"}</button>
            {editingId && <button type="button" onClick={resetSkillForm} className="bg-gray-500 text-white px-4 rounded hover:bg-gray-600">Cancel</button>}
          </div>
        </form>
        <ul className="space-y-2">{skills.map(s=>(
          <li key={s.id} className="p-4 bg-gray-50 border rounded-lg flex justify-between">
            <div><p className="font-semibold">{s.name}</p><p className="text-sm text-gray-600">{s.category}</p>{s.description && <p className="text-sm text-gray-500">{s.description}</p>}</div>
            <div className="flex gap-3"><button onClick={()=>handleEdit(s)} className="text-blue-600 text-sm">Edit</button><button onClick={()=>handleDelete(s.id)} className="text-red-600 text-sm">Delete</button></div>
          </li>))}
        </ul>
      </Card>

      <Card title="Assign Skill to Personnel">
        <form onSubmit={handleAssign} className="grid md:grid-cols-4 gap-4">
          <select className="border p-2 rounded" value={assignForm.personnelId} onChange={e=>setAssignForm({...assignForm,personnelId:e.target.value})}>
            <option value="">Select Personnel</option>{personnel.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={assignForm.skillId} onChange={e=>setAssignForm({...assignForm,skillId:e.target.value})}>
            <option value="">Select Skill</option>{skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={assignForm.proficiency} onChange={e=>setAssignForm({...assignForm,proficiency:e.target.value})}>
            {PROFICIENCY_LEVELS.map(lvl=><option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <button className="bg-green-600 text-white rounded hover:bg-green-700">Assign</button>
        </form>
      </Card>

      <Card title="Personnel & Assigned Skills">
        <ul className="space-y-3">{personnel.length===0?<li className="text-gray-500">No personnel found.</li>:personnel.map(p=>(
          <li key={p.id} className="border p-3 rounded">
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-gray-600">{p.role||"—"} — {p.experience||"—"}</p>
            <div className="mt-2 flex flex-wrap gap-2">{(p.skills||[]).map(s=>(
              <span key={s.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{s.name} ({s.proficiency})</span>
            ))}</div>
          </li>
        ))}</ul>
      </Card>
    </div>
  );
}
