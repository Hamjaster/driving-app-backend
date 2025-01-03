import httpStatus from 'http-status';
import Config from '../config/config.js';
import { Payment } from '../models/payment.model.js';
import { Pupil } from '../models/pupil.model.js';
import { Instructor } from '../models/instructor.model.js';
import { Booking } from '../models/booking.model.js';

import dotenv from 'dotenv';
import Stripe from 'stripe';
import { ApiError } from '../utils/ApiError.js';
dotenv.config();

const stripe = new Stripe(Config.stripeClientSecret);

const PaymentController = {
  quickPayment: async (req: any, res: any) => {
    try {
      const pupil = req.user;
      if (!pupil) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }
      const instructor = await Instructor.findById(req.body.instructorId);
      if (!instructor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Instructor not found');
      }

      if (!pupil || !instructor) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Pupil or Instructor was not found',
        });
      }

      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',
        metadata: {
          company: 'Driving App',
          pupil: pupil.firstName,
          instructor: instructor.firstName,
        },
      });

      const paymentCreated = await Payment.create({
        pupil: pupil._id,
        instructor: req.body.instructorId,
        amount: req.body.amount,
        paymentStatus: 'Pending',
      });

      if (!paymentCreated) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Payment not created',
        });
      }

      res.status(httpStatus.ACCEPTED).send({
        success: true,
        client_secret: myPayment.client_secret,
        paymentId: paymentCreated.id,
      });
    } catch (err) {
      console.error(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Internal Server Error', error: err });
    }
  },
  payForBooking: async (req: any, res: any) => {
    try {
      const pupilId = req.user._id;
      if (!pupilId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }
      const bookingF = await Booking.findById(req.body.bookingId).populate('instructor', 'pupil');

      if (!bookingF) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
      }
      if (bookingF.status !== 'accepted') {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message:
            'The Booking is not approved by the admin yet. Please wait for the approval, then the payment can be proceeded.',
        });
      }
      const amount = bookingF.package.price;
      const myPayment = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          company: 'Driving App',
          pupil: bookingF.pupil.firstName,
          instructor: bookingF.instructor.firstName,
        },
      });
      // Create payment in DB
      const paymentCreated = await Payment.create({
        pupil: pupilId,
        instructor: bookingF.instructor.id,
        booking: req.body.bookingId,
        amount: bookingF.package.price,
        paymentStatus: 'Pending',
      });

      if (!paymentCreated) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Payment not created',
        });
      }

      res.status(httpStatus.ACCEPTED).send({
        success: true,
        client_secret: myPayment.client_secret,
        paymentId: paymentCreated.id,
      });
    } catch (err) {
      console.error(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Internal Server Error', error: err });
    }
  },
  sendApiKey: async (req: any, res: any) => {
    try {
      res.status(httpStatus.ACCEPTED).send({
        StripeApiKey: Config.stripeApiKey,
      });
    } catch (err) {
      console.error(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Internal Server Error', error: err });
    }
  },
  confirmPayment: async (req: any, res: any) => {
    try {
      const payment = await Payment.findById(req.body.paymentId);
      if (!payment) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
      }
      // Update payment
      payment.paymentStatus = 'Completed';
      await payment.save();
      if (payment.booking) {
        // Update the booking as paid
        const booking = await Booking.findByIdAndUpdate(payment.booking, {
          bookingAmountDeducted: true,
        });

        if (!booking) {
          return res.status(httpStatus.BAD_REQUEST).send({
            success: false,
            message: 'Booking not updated',
          });
        }
      }

      res.status(httpStatus.ACCEPTED).send({
        success: true,
        message: 'Payment confirmed',
        payment,
      });
    } catch (err) {
      console.error(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Internal Server Error', error: err });
    }
  },
  getPaymentHistory: async (req: any, res: any) => {
    try {
      const pupil = req.user;
      if (!pupil) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }
      const payments = await Payment.find({ pupil: pupil._id }).populate('instructor', 'firstName lastName');
      if (!payments || payments.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No payment history found');
      }
      res.status(httpStatus.ACCEPTED).send({
        success: true,
        payments,
      });
    } catch (err) {
      console.error(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Internal Server Error', error: err });
    }
  },
};

export default PaymentController;
