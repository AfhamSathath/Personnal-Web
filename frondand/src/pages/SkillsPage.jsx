import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    api.get("/skills").then(res => setSkills(res.data));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card title="Skill Catalog">
        <ul className="space-y-2">
          {skills.map(s => (
            <li
              key={s.id}
              className="p-3 bg-gray-50 rounded-lg border"
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-600">
                {s.category}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
