import httpStatus from 'http-status';
import adminServices from '../services/admin.service';
import { Pupil } from '../models/pupil.model';
import tokenServices from '../services/token.service';
import { tokenTypes, userTypes } from '../config/tokens';
import { sendEmail, sendPupilApprovalEmail } from '../services/email.service';
import Config from '../config/config';

const AdminController = {
  async approvePupilRequest(req: any, res: any): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        throw new Error('Approval token not found');
      }
      const pupilId = await adminServices.approvePupil(token);
      const updatedPupil = await Pupil.findByIdAndUpdate(
        pupilId,
        { isApproved: true }, // Update the isApproved field
        { new: true } // Return the updated document
      );

      if (!updatedPupil) {
        return res.status(404).send({ message: 'Pupil not found' });
      }
      // Send OTP to Pupil for login
      const otp = tokenServices.generateOTP(updatedPupil.id, userTypes.PUPIL);
      sendEmail(updatedPupil.email, 'Your OTP for login', '', Config.otpPupilEmailText(otp));

      res.status(httpStatus.ACCEPTED).send({ message: 'Registration of Pupil is approved' });
    } catch (error: any) {
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },
};

export default AdminController;
