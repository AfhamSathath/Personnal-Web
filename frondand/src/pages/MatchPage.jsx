import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";

export default function MatchPage() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get("/match/1").then(res => setMatches(res.data));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card title="Recommended Team Members">
        {matches.length === 0 && (
          <p className="text-gray-500">No matching personnel found</p>
        )}

        {matches.map((m, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 mb-3 hover:shadow transition"
          >
            <h3 className="font-semibold text-primary">
              {m.name} – {m.role}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {m.skills.join(", ")}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
