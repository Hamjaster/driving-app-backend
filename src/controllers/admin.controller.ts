import httpStatus from 'http-status';
import adminServices from '../services/admin.service.js';
import { Pupil } from '../models/pupil.model.js';
import tokenServices from '../services/token.service.js';
import { tokenTypes, userTypes } from '../config/tokens.js';
import { sendEmail, sendPupilApprovalEmail } from '../services/email.service.js';
import Config from '../config/config.js';
import { Instructor } from '../models/instructor.model.js';
import { Booking } from '../models/booking.model.js';

const AdminController = {
  async approvePupilRequest(req: any, res: any): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        throw new Error('Approval token not found');
      }
      const pupilId = await adminServices.approvePupil(token);
      const updatedPupil = await Pupil.findById(pupilId);

      if (!updatedPupil) {
        return res.status(404).send({ message: 'Pupil not found' });
      }
      // Send OTP to Pupil for login
      const otp = tokenServices.generateOTP(updatedPupil.id, userTypes.PUPIL);
      await sendEmail(updatedPupil.email, 'Your OTP for login', '', Config.otpPupilEmailText(otp));

      res.status(httpStatus.ACCEPTED).send({ message: 'Registration of Pupil is approved' });
    } catch (error: any) {
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },
  async processBookingApproval(req: any, res: any) {
    const { token, status } = req.body; // `status` can be 'accepted' or 'rejected'

    try {
      const isApproved = await tokenServices.verifyToken(token, tokenTypes.BOOKING_APPROVAL, userTypes.PUPIL);
      console.log(isApproved, 'is approved?');
      // const { pupilId, instructorId, date } = decoded;
      const bookingId = isApproved.user;

      // Find the booking
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found or already processed' });
      }

      // Update the booking status
      booking.status = status;

      // If accepted, mark instructor as unavailable for the date
      if (status === 'accepted') {
        const instructor = await Instructor.findById(booking.instructor);
        console.log(instructor, 'instructor');
        instructor.availability = instructor.availability.map((availability) => {
          if (new Date(availability.date).toISOString() === new Date(booking.date).toISOString()) {
            availability.isAvailable = false;
          }
          return availability;
        });

        await instructor.save();
        console.log('instructor availablity made false at ', booking.date);
      }

      await booking.save();

      return res.status(200).json({
        success: true,
        message: `Booking has been ${status} successfully`,
        booking,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, message: 'Internal Server Error' });
    }
  },
};

export default AdminController;
