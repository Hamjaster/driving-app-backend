import { TokenType, userTypes } from '../config/tokens.js';
import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import httpStatus from 'http-status';
import config from '../config/config.js';
// import * as userService from './user.service';
import { IToken, Token } from '../models/token.model.js';
import { ApiError } from '../utils/ApiError.js';
import { tokenTypes } from '../config/tokens.js';
import { token } from 'morgan';
import { generateOTPUtil } from '../utils/lib.js';

const tokenServices = {
  saveToken: async (token: string, userId: string, expires: Moment, type: string, userType: string, blacklisted = false) => {
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

  generateToken: (userId: string, type: string, userType: string, expires?: Moment, secret = config.jwt.secret) => {
    let payload;
    if (expires) {
      payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
      };
    } else {
      payload = {
        sub: userId,
        iat: moment().unix(),
        type,
      };
    }
    const tokken = jwt.sign(payload, secret);
    tokenServices.saveToken(tokken, userId, null, type, userType);
    return tokken;
  },

  generateOTP: (userId: string, userType: string) => {
    const token = generateOTPUtil(6);
    tokenServices.saveToken(token, userId, new Date(Date.now() + 1000), tokenTypes.OTP, userType);
    return token;
  },

  verifyToken: async (token: string, type: string, userType?: string) => {
    const payload = jwt.verify(token, config.jwt.secret);
    console.log(payload, 'payload', token, 'token');
    let userId = payload.sub as string;
    let tokenDoc;
    if (userType) {
      tokenDoc = await Token.findOne({ token, type, user: userId, blacklisted: false, userType });
    } else {
      tokenDoc = await Token.findOne({ token, type, user: userId, blacklisted: false });
    }
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

  generateResetPasswordToken: async (userId: string, userType: string) => {
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = tokenServices.generateToken(userId, tokenTypes.RESET_PASSWORD, userType, expires);
    await tokenServices.saveToken(resetPasswordToken, userId, expires, tokenTypes.RESET_PASSWORD, userType);
    return resetPasswordToken;
  },

  // generateVerifyEmailToken: async (user: any) => {
  //   const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  //   const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  //   await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  //   return verifyEmailToken;
  // },
};

export default tokenServices;
