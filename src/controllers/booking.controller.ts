import { Pupil } from '../models/pupil.model.js';
import { IInstructor, Instructor } from '../models/instructor.model.js';
import { Booking } from '../models/booking.model.js';
import { sendEmail } from '../services/email.service.js';
import Config from '../config/config.js';
import tokenServices from '../services/token.service.js';
import { tokenTypes, userTypes } from '../config/tokens.js';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError.js';
import { ppid } from 'process';

const bookingController = {
  createBooking: async (req: any, res: any) => {
    const { pupilId, instructorId, bookingType, package: pkg, lessonsType, start, end } = req.body;

    try {
      if (!pupilId || !instructorId || !start || !end) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Required fields are missing');
      }

      // Check instructor availability
      const instructor = await Instructor.findById(instructorId);
      const pupil = await Pupil.findById(pupilId);

      if (!instructor || !pupil) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Instructor or Pupil not found');
      }

      console.log(instructor, 'inst', start, 'start', end, 'end');

      const isInstructorAvailable = (instructor: IInstructor, start: Date, end: Date): boolean => {
        return instructor.availability.some((availability) => {
          const availabilityStart = new Date(availability.start);
          const availabilityEnd = new Date(availability.end);

          // Check if the start and end fall within the availability range
          return start >= availabilityStart && end <= availabilityEnd;
        });
      };

      const isAvailable = isInstructorAvailable(instructor, new Date(start), new Date(end));

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
          `A new booking request has been created by pupil ${pupil.firstName}. Please approve or reject using the token below:\n\nToken: ${approvalToken}`
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
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
  },
  getBookings: async (req: any, res: any) => {
    const pupilId = req.user._id;

    try {
      if (!pupilId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }

      const allBookings = await Booking.find({ pupil: pupilId }).populate('instructor', 'firstName lastName email');
      if (!allBookings || allBookings.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No bookings found');
      }
      return res.status(httpStatus.OK).json({ success: true, bookings: allBookings });
    } catch (error) {
      console.error(error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
  },
};

export default bookingController;
