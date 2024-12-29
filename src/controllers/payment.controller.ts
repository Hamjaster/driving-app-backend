import httpStatus from 'http-status';
import Config from '../config/config';
import { Payment } from '../models/payment.model';
import { Pupil } from '../models/pupil.model';
import { Instructor } from '../models/instructor.model';
import { Booking } from '../models/booking.model';

import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();

const stripe = new Stripe(Config.stripeClientSecret);

const PaymentController = {
  quickPayment: async (req: any, res: any) => {
    try {
      const pupil = req.user;
      const instructor = await Instructor.findById(req.body.instructorId);

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
      res.send(err);
    }
  },
  payForBooking: async (req: any, res: any) => {
    try {
      const pupilId = req.user._id;
      const bookingF = await Booking.findById(req.body.bookingId).populate('instructor', 'pupil');

      if (!bookingF) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: 'The desired booking was not found',
        });
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
      res.send(err);
    }
  },
  sendApiKey: async (req: any, res: any) => {
    res.status(httpStatus.ACCEPTED).send({
      StripeApiKey: Config.stripeApiKey,
    });
  },
  confirmPayment: async (req: any, res: any) => {
    try {
      const payment = await Payment.findById(req.body.paymentId);
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Payment not confirmed', error: err });
    }
  },
  getPaymentHistory: async (req: any, res: any) => {
    try {
      const pupil = req.user;
      const payments = await Payment.find({ pupil: pupil._id }).populate('instructor', 'firstName lastName');
      res.status(httpStatus.ACCEPTED).send({
        success: true,
        payments,
      });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Payments not found', error: err });
    }
  },
};

export default PaymentController;
