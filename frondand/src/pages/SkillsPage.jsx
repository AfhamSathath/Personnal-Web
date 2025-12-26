import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Users, ClipboardList, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_SKILLS = "http://localhost:5000/api/skills";
const API_PERSONNEL = "http://localhost:5000/api/personnel";
const API_ASSIGN = "http://localhost:5000/api/personnel-skills";

const PROFICIENCY_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
const SKILL_CATEGORIES = ["Programming Language","Framework","Tool","Soft Skill"];
const COMMON_SKILLS = ["React","Python","AWS","Node.js","Java","Docker"];

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [assignedSkills, setAssignedSkills] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({name:"", category:"", description:""});
  const [assignForm, setAssignForm] = useState({personnelId:"", skillId:"", proficiency:"Beginner"});
  const [activeTab, setActiveTab] = useState("skills");

  const [searchName, setSearchName] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // Fetch skills, personnel, assigned skills
  const fetchSkills = useCallback(async () => {
    try { const res = await axios.get(API_SKILLS); setSkills(res.data); } 
    catch(err){ console.error(err); toast.error("Failed to fetch skills"); }
  }, []);
  const fetchPersonnel = useCallback(async () => {
    try { const res = await axios.get(API_PERSONNEL); setPersonnel(res.data); } 
    catch(err){ console.error(err); toast.error("Failed to fetch personnel"); }
  }, []);
  const fetchAssignedSkills = useCallback(async () => {
    try { const res = await axios.get(API_ASSIGN); setAssignedSkills(res.data); } 
    catch(err){ console.error(err); toast.error("Failed to fetch assigned skills"); }
  }, []);

  useEffect(() => {
    fetchSkills(); fetchPersonnel(); fetchAssignedSkills();
  }, [fetchSkills, fetchPersonnel, fetchAssignedSkills]);

  const resetSkillForm = () => { setForm({name:"",category:"",description:""}); setEditingId(null); };

  // Add/Edit skill
  const handleSubmit = async(e) => {
    e.preventDefault();
    if(!form.name || !form.category) return toast.error("Name and category required");
    try {
      if(editingId){
        await axios.put(`${API_SKILLS}/${editingId}`, form);
        toast.success("Skill updated!");
      } else {
        await axios.post(API_SKILLS, form);
        toast.success("Skill added!");
      }
      resetSkillForm();
      fetchSkills();
    } catch(err){ console.error(err); toast.error(err.response?.data?.message || "Server error"); }
  };

  const handleEdit = (skill) => { setEditingId(skill.id); setForm({name: skill.name, category: skill.category, description: skill.description||""}); };
  const handleDelete = async(id) => { 
    if(!window.confirm("Delete this skill?")) return; 
    try { await axios.delete(`${API_SKILLS}/${id}`); toast.success("Skill deleted"); fetchSkills(); } 
    catch(err){ console.error(err); toast.error("Delete failed"); }
  };

  // Assign skill to personnel
  const handleAssign = async(e) => {
    e.preventDefault();
    const personnelId = Number(assignForm.personnelId);
    const skillId = Number(assignForm.skillId);
    if(!personnelId || !skillId) return toast.error("Select valid personnel & skill");

    try {
      await axios.post(API_ASSIGN, { personnelId, skillId, proficiency: assignForm.proficiency });
      setAssignForm({ personnelId:"", skillId:"", proficiency:"Beginner" });
      toast.success("Skill assigned successfully");
      fetchPersonnel();
      fetchSkills();
      fetchAssignedSkills();
    } catch(err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Assign failed");
    }
  };

  // Combine assigned skills with personnel for Personnel table
  const personnelWithSkills = personnel.map(p => ({
    ...p,
    skills: assignedSkills.filter(s => s.personnel_id === p.id).map(s => ({
      id: s.skill_id,
      name: s.skill_name,
      proficiency: s.proficiency
    }))
  }));

  const filteredPersonnel = personnelWithSkills.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(searchName.toLowerCase());
    const skillMatch = searchSkill ? (p.skills||[]).some(s => s.name.toLowerCase().includes(searchSkill.toLowerCase())) : true;
    const levelMatch = filterLevel ? (p.skills||[]).some(s => s.proficiency === filterLevel) : true;
    return nameMatch && skillMatch && levelMatch;
  });

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 to-indigo-700 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">IT Skills Manager</h2>
        <nav className="flex-1 space-y-4">
          <button onClick={()=>setActiveTab("skills")} className={`flex items-center gap-2 p-3 w-full rounded-lg hover:bg-blue-800 transition ${activeTab==="skills"?"bg-blue-900 shadow-lg":""}`}><ClipboardList size={20}/> Skill Catalog</button>
          <button onClick={()=>setActiveTab("assign")} className={`flex items-center gap-2 p-3 w-full rounded-lg hover:bg-blue-800 transition ${activeTab==="assign"?"bg-blue-900 shadow-lg":""}`}><PlusCircle size={20}/> Assign Skills</button>
          <button onClick={()=>setActiveTab("personnel")} className={`flex items-center gap-2 p-3 w-full rounded-lg hover:bg-blue-800 transition ${activeTab==="personnel"?"bg-blue-900 shadow-lg":""}`}><Users size={20}/> Personnel</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* Skill Catalog */}
        {activeTab==="skills" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Skill Catalog</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 mb-6 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <input list="skill-options" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400" placeholder="Skill Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
              <datalist id="skill-options">{COMMON_SKILLS.map(s=><option key={s} value={s}/>)}</datalist>
              <select className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required>
                <option value="">Select Category</option>{SKILL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              <div className="md:col-span-3 flex gap-3 mt-2">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition">{editingId?"Update Skill":"Add Skill"}</button>
                {editingId && <button type="button" onClick={resetSkillForm} className="bg-gray-400 text-white px-4 rounded-lg hover:bg-gray-500 transition">Cancel</button>}
              </div>
            </form>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Category</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s.id} className="hover:bg-blue-50 transition">
                      <td className="border px-4 py-2">{s.name}</td>
                      <td className="border px-4 py-2">{s.category}</td>
                      <td className="border px-4 py-2">{s.description||"—"}</td>
                      <td className="border px-4 py-2 text-center flex justify-center gap-2">
                        <button onClick={()=>handleEdit(s)} className="text-blue-600 hover:underline flex items-center gap-1"><CheckCircle size={16}/> Edit</button>
                        <button onClick={()=>handleDelete(s.id)} className="text-red-600 hover:underline flex items-center gap-1"><XCircle size={16}/> Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Skills */}
        {activeTab==="assign" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Assign Skill to Personnel</h3>
            <form onSubmit={handleAssign} className="grid md:grid-cols-4 gap-4 mb-4 bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition">
              <select className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400" value={assignForm.personnelId} onChange={e=>setAssignForm({...assignForm,personnelId:e.target.value})}>
                <option value="">Select Personnel</option>
                {personnel.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400" value={assignForm.skillId} onChange={e=>setAssignForm({...assignForm,skillId:e.target.value})}>
                <option value="">Select Skill</option>
                {skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400" value={assignForm.proficiency} onChange={e=>setAssignForm({...assignForm,proficiency:e.target.value})}>
                {PROFICIENCY_LEVELS.map(lvl=><option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition">Assign</button>
            </form>

            {/* Assigned Skills Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-green-100">
                  <tr>
                    <th className="border px-4 py-2">Personnel</th>
                    <th className="border px-4 py-2">Skill</th>
                    <th className="border px-4 py-2">Proficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedSkills.length === 0 ? (
                    <tr><td colSpan={3} className="text-center p-4 text-gray-500">No assigned skills</td></tr>
                  ) : assignedSkills.map(s => (
                    <tr key={s.id} className="hover:bg-green-50 transition">
                      <td className="border px-4 py-2">{s.personnel_name}</td>
                      <td className="border px-4 py-2">{s.skill_name}</td>
                      <td className="border px-4 py-2">{s.proficiency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Personnel Table */}
        {activeTab==="personnel" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Personnel & Assigned Skills</h3>

            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <input type="text" placeholder="Search personnel..." value={searchName} onChange={e=>setSearchName(e.target.value)} className="p-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-400"/>
              <input type="text" placeholder="Search skill..." value={searchSkill} onChange={e=>setSearchSkill(e.target.value)} className="p-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-400"/>
              <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="p-2 border rounded-lg shadow">
                <option value="">All Levels</option>
                {PROFICIENCY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              <button type="button" onClick={()=>{setSearchName(""); setSearchSkill(""); setFilterLevel("");}} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">Clear</button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="border px-4 py-2">Personnel</th>
                    <th className="border px-4 py-2">Role</th>
                    <th className="border px-4 py-2">Experience</th>
                    <th className="border px-4 py-2">Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.length===0 ? (
                    <tr><td colSpan={4} className="text-center p-4 text-gray-500">No personnel found</td></tr>
                  ) : filteredPersonnel.map(p => (
                    <tr key={p.id} className="hover:bg-yellow-50 transition">
                      <td className="border px-4 py-2">{p.name}</td>
                      <td className="border px-4 py-2">{p.role || "—"}</td>
                      <td className="border px-4 py-2">{p.experience || "—"}</td>
                      <td className="border px-4 py-2">
                        {(p.skills||[]).map(s => (
                          <span key={s.id} className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1
                            ${s.proficiency==="Beginner"?"bg-blue-100 text-blue-800":
                            s.proficiency==="Intermediate"?"bg-yellow-100 text-yellow-800":
                            s.proficiency==="Advanced"?"bg-purple-100 text-purple-800":
                            "bg-green-100 text-green-800"}`}>
                            {s.name} ({s.proficiency})
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
