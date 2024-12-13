import express from 'express';
import AdminController from '../../controllers/admin.controller.js';

const router = express.Router();

router.post('/approvePupil', AdminController.approvePupilRequest);

export default router;
