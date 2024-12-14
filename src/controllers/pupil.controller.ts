import httpStatus from 'http-status';
import pupilService from '../services/pupil.service.js';
import tokenService from '../services/token.service.js';
import { tokenTypes, userTypes } from '../config/tokens.js';
import { IPupil, Pupil } from '../models/pupil.model.js';
import { ApiError } from '../utils/ApiError.js';
import { sendPupilApprovalEmail, sendResetPasswordEmail } from '../services/email.service.js';
import { error } from 'console';
import { hashPassword, verifyPassword } from '../utils/lib.js';

// import catchAsync from '../utils/catchAsync';
// import { pupilService, emailService, tokenService } from '../services'

export const PupilController = {
  async register(req: any, res: any): Promise<void> {
    try {
      const body = req.body as IPupil;
      const pupil = await pupilService.createPupil(body);
      // const token = tokenService.generateToken(pupil.id, tokenTypes.ACCESS);

      // Send approval to admin
      const approvalToken = tokenService.generateToken(pupil.id, tokenTypes.VERIFY_PUPIL, userTypes.PUPIL);
      sendPupilApprovalEmail(pupil.firstName, 'hamzashah.dev@gmail.com', approvalToken);

      res.status(httpStatus.CREATED).send({ message: 'You approval request have been sent to admin' });
    } catch (error: any) {
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },

  async login(req: any, res: any): Promise<void> {
    try {
      const { email, password, otp } = req.body;
      const pupil = await pupilService.getPupilByEmail(email);
      // @ts-ignore
      if (!pupil || !(await pupil.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
      }

      if (!pupil.isApproved && !otp) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Kindly pass the OTP obtained after the account approval');
      }
      if (otp) {
        // Approving the account if otp is given
        const otpVerified = tokenService.verifyOTP(otp, pupil.id);
        if (!otpVerified) {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'The OTP is incorrect');
        }
        await Pupil.findByIdAndUpdate(
          pupil.id,
          { isApproved: true }, // Update the isApproved field
          { new: true } // Return the updated document
        );
      }
      const token = tokenService.generateToken(pupil.id, tokenTypes.ACCESS, userTypes.PUPIL);
      res.status(httpStatus.OK).send({ pupil, token });
    } catch (error: any) {
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },

  async forgotPassword(req: any, res: any) {
    const { email } = req.body;
    const pupil = await Pupil.findOne({ email });
    if (!pupil) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No Such Pupil Registered');
    }
    const resetPasswordToken = await tokenService.generateResetPasswordToken(pupil.id, userTypes.PUPIL);
    await sendResetPasswordEmail(email, resetPasswordToken);
    res.status(httpStatus.OK).send({ message: 'Reset Password link sent to email' });
  },

  async changeForgottenPassword(req: any, res: any) {
    try {
      const { token, password } = req.body;
      const tokenDoc = await tokenService.verifyToken(token, tokenTypes.RESET_PASSWORD, userTypes.PUPIL);
      if (!tokenDoc) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthenticated');
      }
      const pupilFound = await pupilService.getPupilById(tokenDoc.user);
      if (!pupilFound) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'No Such Pupil Registered');
      }

      await Pupil.findByIdAndUpdate(
        pupilFound.id,
        { password: await hashPassword(password) },
        { new: true, runValidators: true }
      );

      res.status(httpStatus.OK).send({ message: 'Password updated' });
    } catch (error) {
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },
};

export default PupilController;

// const register = catchAsync(async (req: { email: string; password: string }, res: any) => {
//   const token = await tokenService.generateToken(req.email, tokenTypes.ACCESS);

//   const pupil = Pupil.create
//   res.status(httpStatus.CREATED).send({ user, token })

// });

// const login = catchAsync(async (req: any, res: any) => {
//   const { email, password } = req.body;
//   const user = await authService.loginUserWithEmailAndPassword(email, password);
//   const tokens = await tokenService.generateToken(user);
//   res.send({ user, tokens });
// });

// const logout = catchAsync(async (req: any, res: any) => {
//   await authService.logout(req.body.refreshToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const refreshTokens = catchAsync(async (req: any, res: any) => {
//   const tokens = await authService.refreshAuth(req.body.refreshToken);
//   res.send({ ...tokens });
// });

// const resetPassword = catchAsync(async (req: any, res: any) => {
//   await authService.resetPassword(req.query.token, req.body.password);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const sendVerificationEmail = catchAsync(async (req: any, res: any) => {
//   const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
//   await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const verifyEmail = catchAsync(async (req: any, res: any) => {
//   await authService.verifyEmail(req.query.token);
//   res.status(httpStatus.NO_CONTENT).send();
// });
