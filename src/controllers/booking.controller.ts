import { Pupil } from '../models/pupil.model';
import { Instructor } from '../models/instructor.model';
import { Booking } from '../models/booking.model';
import { sendEmail } from '../services/email.service';
import Config from '../config/config';
import tokenServices from '../services/token.service';
import { tokenTypes, userTypes } from '../config/tokens';
import httpStatus from 'http-status';

const bookingController = {
  createBooking: async (req: any, res: any) => {
    const pupilId = req.user._id;
    const { instructorId, bookingType, package: pkg, lessonsType, date } = req.body;

    try {
      // Check instructor availability
      const instructor = await Instructor.findById(instructorId);

      if (!instructor) {
        return res.status(404).json({ success: false, message: 'Instructor not found' });
      }

      const isAvailable = instructor.availability.some(
        (availability) =>
          availability.isAvailable && new Date(availability.date).toISOString() === new Date(date).toISOString()
      );

      if (isAvailable) {
        // Mark the instructor as unavailable for the chosen date
        instructor.availability = instructor.availability.map((availability) => {
          if (new Date(availability.date).toISOString() === new Date(date).toISOString()) {
            availability.isAvailable = false;
          }
          return availability;
        });

        await instructor.save();

        // Temporarily create the booking in pending status
        const booking = await Booking.create({
          pupilId,
          instructorId,
          bookingType,
          package: pkg,
          lessonsType,
          date,
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
          message: 'The instructor is not available for that date',
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

export default bookingController;
