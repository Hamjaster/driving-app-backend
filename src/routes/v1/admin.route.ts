import express from 'express';
import AdminController from '../../controllers/admin.controller';

const router = express.Router();

router.post('/approvePupil', AdminController.approvePupilRequest);

export default router;
