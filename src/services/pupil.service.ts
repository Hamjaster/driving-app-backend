import httpStatus from 'http-status';
import tokenService from './token.service.js';
import userService from './token.service.js';
import { Token } from '../models/token.model.js';
import { tokenTypes } from '../config/tokens.js';
import { ApiError } from '../utils/ApiError.js';
import { IPupil, Pupil } from '../models/pupil.model.js';
import { Document } from 'mongoose';
import { hashPassword } from '../utils/lib.js';

const pupilServices = {
  async createPupil(pupilBody: IPupil): Promise<IPupil> {
    // Check if the email is already taken
    // @ts-ignore
    const emailTaken = await Pupil.isEmailTaken(pupilBody.email);
    if (emailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    pupilBody.password = await hashPassword(pupilBody.password);

    const pupil = new Pupil(pupilBody);
    pupil.save();
    return pupil;
  },

  getAllPupils(): Promise<IPupil[]> {
    return Pupil.find() as any;
  },

  async getPupilById(id: string): Promise<IPupil | null> {
    const pupil = await Pupil.findById(id);

    if (!pupil) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Pupil not found');
    }

    return pupil;
  },

  async getPupilByEmail(email: string): Promise<IPupil | null> {
    const pupil = await Pupil.findOne({ email });

    if (!pupil) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Pupil not found');
    }

    return pupil;
  },

  // loginPupil: async (email: string, password: string) => {

  //   const user = await userService.getUserByEmail(email);
  //   if (!user || !(await user.isPasswordMatch(password))) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  //   }
  //   return user;
  // },

  logout: async (refreshToken: string) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.remove();
  },

  // const refreshAuth = async (refreshToken) => {
  //   try {
  //     const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  //     const user = await userService.getUserById(refreshTokenDoc.user);
  //     if (!user) {
  //       throw new Error();
  //     }
  //     await refreshTokenDoc.remove();
  //     return tokenService.generateAuthTokens(user);
  //   } catch (error) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  //   }
  // };

  // resetPassword: async (resetPasswordToken: string, newPassword: string) => {
  //   try {
  //     const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
  //     const user = await userService.getUserById(resetPasswordTokenDoc.user);
  //     if (!user) {
  //       throw new Error();
  //     }
  //     await userService.updateUserById(user.id, { password: newPassword });
  //     await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  //   } catch (error) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  //   }
  // },

  // verifyEmail: async (verifyEmailToken: string) => {
  //   try {
  //     const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
  //     const user = await userService.getUserById(verifyEmailTokenDoc.user);
  //     if (!user) {
  //       throw new Error();
  //     }
  //     await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
  //     await userService.updateUserById(user.id, { isEmailVerified: true });
  //   } catch (error) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  //   }
  // },
};

export default pupilServices;
