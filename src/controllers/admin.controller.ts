import httpStatus from 'http-status';
import adminServices from '../services/admin.service.js';
import { Pupil } from '../models/pupil.model.js';
import tokenServices from '../services/token.service.js';
import { tokenTypes, userTypes } from '../config/tokens.js';
import { sendEmail, sendPupilApprovalEmail } from '../services/email.service.js';
import Config from '../config/config.js';
import { Instructor } from '../models/instructor.model.js';
import { Booking } from '../models/booking.model.js';
import { ApiError } from '../utils/ApiError.js';

const AdminController = {
  async approvePupilRequest(req: any, res: any): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Approval token is required');
      }
      const pupilId = await adminServices.approvePupil(token);
      const updatedPupil = await Pupil.findById(pupilId);

      if (!updatedPupil) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Pupil not found');
      }
      // Send OTP to Pupil for login
      const otp = tokenServices.generateOTP(updatedPupil.id, userTypes.PUPIL);
      await sendEmail(updatedPupil.email, 'Your OTP for login', '', Config.otpPupilEmailText(otp));

      res.status(httpStatus.ACCEPTED).send({ message: 'Registration of Pupil is approved' });
    } catch (error: any) {
      console.error(error);
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },
  async processBookingApproval(req: any, res: any) {
    const { token, status } = req.body; // `status` can be 'accepted' or 'rejected'

    try {
      if (!token || !status) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Token and status are required');
      }
      const isApproved = await tokenServices.verifyToken(token, tokenTypes.BOOKING_APPROVAL, userTypes.PUPIL);
      if (!isApproved) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
      }
      const bookingId = isApproved.user;

      // Find the booking
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found or already processed');
      }

      // Update the booking status
      booking.status = status;

      // If accepted, mark instructor as unavailable for the date
      if (status === 'accepted') {
        const instructor = await Instructor.findById(booking.instructor);
        console.log(instructor, 'instructor');
        // Remove the object from instructor availability if it matches the booking start and end
        instructor.availability = instructor.availability.filter((availability) => {
          return !(
            new Date(availability.start).toISOString() === new Date(booking.start).toISOString() &&
            new Date(availability.end).toISOString() === new Date(booking.end).toISOString()
          );
        });

        await instructor.save();
        console.log('instructor availability updated at ', booking.start, booking.end);
      }

      await booking.save();

      return res.status(200).json({
        success: true,
        message: `Booking has been ${status} successfully`,
        booking,
      });
    } catch (err) {
      console.error(err);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
    }
  },
};

export default AdminController;
