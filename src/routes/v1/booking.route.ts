import express from 'express';
import validate from '../../middlewares/validate.js';
import { auth } from '../../middlewares/auth.js';
import bookingValidations from '../../validations/booking.validation.js';
import bookingController from '../../controllers/booking.controller.js';

const router = express.Router();

router.post('/create', auth('pupil'), validate(bookingValidations.createBooking), bookingController.createBooking);

export default router;
