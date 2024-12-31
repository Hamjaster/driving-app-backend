import { Pupil } from '../models/pupil.model.js';
import { Instructor } from '../models/instructor.model.js';
import { Booking } from '../models/booking.model.js';
import { sendEmail } from '../services/email.service.js';
import Config from '../config/config.js';
import tokenServices from '../services/token.service.js';
import { tokenTypes, userTypes } from '../config/tokens.js';
import httpStatus from 'http-status';

const bookingController = {
  createBooking: async (req: any, res: any) => {
    const pupilId = req.user._id;
    const { instructorId, bookingType, package: pkg, lessonsType, start, end } = req.body;

    try {
      // Check instructor availability
      const instructor = await Instructor.findById(instructorId);

      if (!instructor) {
        return res.status(404).json({ success: false, message: 'Instructor not found' });
      }

      const isAvailable = instructor.availability.some((availability) => {
        console.log(new Date(availability.start).toISOString(), new Date(start).toISOString());
        console.log(new Date(availability.end).toISOString(), new Date(end).toISOString());

        return (
          new Date(availability.start).toISOString() === new Date(start).toISOString() &&
          new Date(availability.end).toISOString() === new Date(end).toISOString()
        );
      });

      console.log(isAvailable, 'isAvailable');
      if (isAvailable) {
        // Remove the time slot from availability
        instructor.availability = instructor.availability.filter(
          (availability) =>
            !(
              new Date(availability.start).toISOString() === new Date(start).toISOString() &&
              new Date(availability.end).toISOString() === new Date(end).toISOString()
            )
        );

        await instructor.save();

        // Temporarily create the booking in pending status
        const booking = await Booking.create({
          pupil: pupilId,
          instructor: instructorId,
          bookingType,
          package: pkg,
          lessonsType,
          start,
          end,
          status: 'pending',
        });

        const approvalToken = tokenServices.generateToken(booking.id, tokenTypes.BOOKING_APPROVAL, userTypes.PUPIL);
        // Send email to admin for final approval
        await sendEmail(
          Config.adminEmail,
          'Booking Approval Required',
          `A new booking request has been created by pupil ${req.user.firstName}. Please approve or reject using the token below:\n\nToken: ${approvalToken}`
        );

        return res.status(201).json({
          success: true,
          message: 'Booking created and pending admin approval. Email sent to admin.',
          booking,
        });
      } else {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'The instructor is not available for that time slot',
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  getBookings: async (req: any, res: any) => {
    const pupilId = req.user._id;

    try {
      const allBookings = await Booking.find({ pupil: pupilId }).populate('instructor', 'firstName lastName email');
      return res.status(200).json({ success: true, bookings: allBookings });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

export default bookingController;
