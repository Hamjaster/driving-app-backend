import express from 'express';
import instructorController from '../../controllers/instructor.controller.js';

const router = express.Router();

router.post(
  '/create', // Only admins can create instructors
  instructorController.createInstructor
);

export default router;