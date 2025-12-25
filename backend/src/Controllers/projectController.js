import { db } from "../db.js";

export const createProject = (req, res) => {
  const { name, description, start_date, end_date, status } = req.body;
  db.query(
    "INSERT INTO projects (name,description,start_date,end_date,status) VALUES (?,?,?,?,?)",
    [name, description, start_date, end_date, status],
    () => res.json({ message: "Project created" })
  );
};
