import { personnelModel } from "../models/personnelModel.js";

// Get all personnel
export const getAllPersonnel = async (req, res) => {
  try {
    const results = await personnelModel.getAll();
    res.json(results);
  } catch (err) {
    console.error("Error in getAllPersonnel:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add personnel
export const addPersonnel = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }
    
    const { name, email, role, experience } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    // Experience validation
    const validExperiences = ['Junior', 'Mid-Level', 'Senior'];
    if (experience && !validExperiences.includes(experience)) {
      return res.status(400).json({ 
        error: "Experience must be one of: Junior, Mid-Level, Senior" 
      });
    }
    
    const result = await personnelModel.create({ 
      name, 
      email, 
      role: role || null, 
      experience: experience || 'Junior' 
    });
    
    res.status(201).json({ 
      message: "Personnel added successfully",
      id: result.insertId, 
      name, 
      email, 
      role, 
      experience 
    });
  } catch (err) {
    console.error("Error in addPersonnel:", err);
    
    // Handle specific MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage.includes("email")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      return res.status(409).json({ error: "Duplicate entry detected" });
    }
    
    res.status(500).json({ error: err.message });
  }
};

// Update personnel
export const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }
    
    const { name, email, role, experience } = req.body;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid ID is required" });
    }
    
    // Check if at least one field is provided
    if (!name && !email && !role && !experience) {
      return res.status(400).json({ error: "At least one field to update is required" });
    }
    
    // You need to create an update method in your model
    // For now, let's assume you have one
    const result = await personnelModel.update(id, { name, email, role, experience });
    
    res.json({ 
      message: "Personnel updated successfully",
      affectedRows: result.affectedRows 
    });
  } catch (err) {
    console.error("Error in updatePersonnel:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Email already exists" });
    }
    
    res.status(500).json({ error: err.message });
  }
};

// Delete personnel
export const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid ID is required" });
    }
    
    // You need to create a delete method in your model
    // For now, let's assume you have one
    const result = await personnelModel.delete(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Personnel not found" });
    }
    
    res.json({ 
      message: "Personnel deleted successfully",
      affectedRows: result.affectedRows 
    });
  } catch (err) {
    console.error("Error in deletePersonnel:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single personnel by ID
export const getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid ID is required" });
    }
    
    // You need to create a getById method in your model
    const personnel = await personnelModel.getById(id);
    
    if (!personnel) {
      return res.status(404).json({ error: "Personnel not found" });
    }
    
    res.json(personnel);
  } catch (err) {
    console.error("Error in getPersonnelById:", err);
    res.status(500).json({ error: err.message });
  }
};