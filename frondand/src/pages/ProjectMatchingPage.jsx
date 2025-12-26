import { useState } from "react";
import axios from "axios";
import Card from "../components/Card";

const API_MATCH = "http://localhost:5000/api/matching/project";

export default function ProjectMatchingPage() {
  const [projectId, setProjectId] = useState("");
  const [matches, setMatches] = useState([]);

  const findMatches = async () => {
    if (!projectId) return alert("Enter project ID");
    const res = await axios.get(`${API_MATCH}/${projectId}`);
    setMatches(res.data);
  };

  return (
    <Card title="Project Skill Matching">
      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded-lg"
          placeholder="Project ID"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        />
        <button
          onClick={findMatches}
          className="bg-blue-600 text-white px-4 rounded-lg"
        >
          Find Matches
        </button>
      </div>

      <ul className="space-y-3">
        {matches.map(m => (
          <li key={m.personnelId} className="p-4 border rounded-lg shadow">
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-gray-600">
              Match Score: {m.matchScore}%
            </p>
            <div className="w-full bg-gray-200 rounded h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${m.matchScore}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
