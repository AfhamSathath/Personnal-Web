import pool from "../db.js";

export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM personnel ORDER BY created_at DESC");
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM personnel WHERE id = ?", [id]);
  return rows[0]; 
};

export const create = async ({ name, email, role, experience }) => {
  const [result] = await pool.query(
    "INSERT INTO personnel (name, email, role, experience) VALUES (?, ?, ?, ?)",
    [name, email, role, experience]
  );
  return result;
};

export const update = async (id, { name, email, role, experience }) => {
  const fields = [];
  const values = [];
  
  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  
  if (email !== undefined) {
    fields.push("email = ?");
    values.push(email);
  }
  
  if (role !== undefined) {
    fields.push("role = ?");
    values.push(role);
  }
  
  if (experience !== undefined) {
    fields.push("experience = ?");
    values.push(experience);
  }
  
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }
  
  
  values.push(id);
  
  const query = `UPDATE personnel SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await pool.query(query, values);
  return result;
};

export const deleteById = async (id) => {
  const [result] = await pool.query("DELETE FROM personnel WHERE id = ?", [id]);
  return result;
};

export const personnelModel = { 
  getAll, 
  getById, 
  create, 
  update, 
  delete:deleteById 
}; 