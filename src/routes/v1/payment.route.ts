import express from 'express';
import validate from '../../middlewares/validate.js';
import PaymentController from '../../controllers/payment.controller.js';
import multer from 'multer';
import paymentValidations from '../../validations/payment.validation.js';
import { auth } from '../../middlewares/auth.js';
// import upload from '../../utils/multer.js';
const router = express.Router();

router.get('/getStripeApi', PaymentController.sendApiKey);
router.post('/payForBooking', auth('pupil'), validate(paymentValidations.payForBooking), PaymentController.payForBooking);
router.post('/quickPayment', auth('pupil'), validate(paymentValidations.quickPayment), PaymentController.quickPayment);
router.post('/confirmPayment', auth('pupil'), validate(paymentValidations.confirmPayment), PaymentController.confirmPayment);
router.get('/getPaymentHistory', auth('pupil'), PaymentController.getPaymentHistory);

export default router;
