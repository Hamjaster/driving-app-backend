import { TokenType } from '../config/tokens';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import httpStatus from 'http-status';
import config from '../config/config';
// import * as userService from './user.service';
import { IToken, Token } from '../models/token.model';
import { ApiError } from '../utils/ApiError';
import { tokenTypes } from '../config/tokens';
import { token } from 'morgan';
import { generateOTPUtil } from '../utils/lib';

const tokenServices = {
  saveToken: async (token: string, userId: string, expires: Date, type: string, userType: string, blacklisted = false) => {
    var tokenDoc;
    if (expires) {
      tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires,
        userType,
        type,
        blacklisted,
      });
    } else {
      tokenDoc = await Token.create({
        token,
        user: userId,
        userType,
        type,
        blacklisted,
      });
    }
    return tokenDoc;
  },

  generateToken: (userId: string, type: string, userType: string, secret = config.jwt.secret) => {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      // exp: expires.unix(),
      type,
    };
    const tokken = jwt.sign(payload, secret);
    tokenServices.saveToken(tokken, userId, null, type, userType);
    return tokken;
  },

  generateOTP: (userId: string, userType: string) => {
    const token = generateOTPUtil(6);
    tokenServices.saveToken(token, userId, new Date(Date.now() + 1000), tokenTypes.OTP, userType);
    return token;
  },

  verifyToken: async (token: string, type: string) => {
    const payload = jwt.verify(token, config.jwt.secret);
    console.log(payload, 'payload', token, 'token');
    let userId = payload.sub as string;
    const tokenDoc = await Token.findOne({ token, type, user: userId, blacklisted: false });
    if (!tokenDoc) {
      throw new Error('Token not found');
    }
    return tokenDoc;
  },
  verifyOTP: async (otp: string, userId: string): Promise<boolean> => {
    const tokenDoc = (await Token.findOne({ token: otp, type: tokenTypes.OTP, user: userId })) as IToken;
    if (!tokenDoc) {
      return false;
    }
    if (tokenDoc) console.log('otp was found in db as ', tokenDoc);
    await Token.findByIdAndDelete(tokenDoc.id);
    return true;
  },

  // generateAuthTokens: async (user) => {
  //   const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  //   const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  //   const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  //   const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  //   await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  //   return {
  //     access: {
  //       token: accessToken,
  //       expires: accessTokenExpires.toDate(),
  //     },
  //     refresh: {
  //       token: refreshToken,
  //       expires: refreshTokenExpires.toDate(),
  //     },
  //   };
  // },

  // generateResetPasswordToken: async (email: string) => {
  //   const user = await userService.getUserByEmail(email);
  //   if (!user) {
  //     throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  //   }
  //   const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  //   const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  //   await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  //   return resetPasswordToken;
  // },

  // generateVerifyEmailToken: async (user: any) => {
  //   const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  //   const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  //   await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  //   return verifyEmailToken;
  // },
};

export default tokenServices;
