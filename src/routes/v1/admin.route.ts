import express from 'express';
import AdminController from '../../controllers/admin.controller.js';

const router = express.Router();

router.post('/approvePupil', AdminController.approvePupilRequest);
router.post('/approveBooking', AdminController.processBookingApproval);

export default router;
