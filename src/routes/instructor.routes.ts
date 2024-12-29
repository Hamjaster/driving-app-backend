import express from 'express';
import InstructorController from '../controllers/instructor.controller.js';

const router = express.Router();

// ...existing code...

router.post('/getByPostalCode', InstructorController.getInstructorsByPostalCode);

// ...existing code...

export default router;
