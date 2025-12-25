import express from 'express';
import { 
  getAllPersonnel, 
  getPersonnelById,
  addPersonnel, 
  updatePersonnel, 
  deletePersonnel 
} from '../Controllers/personnelController.js';

const router = express.Router();

// GET all personnel
router.get('/', getAllPersonnel);

// GET single personnel
router.get('/:id', getPersonnelById);

// POST add personnel
router.post('/', addPersonnel);

// PUT update personnel
router.put('/:id', updatePersonnel);

// DELETE personnel
router.delete('/:id', deletePersonnel);

export default router;