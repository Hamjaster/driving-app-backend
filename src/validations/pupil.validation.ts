import Joi from 'joi';
import { password } from './custom.validation.js';

const pupilValidation = {
  register: {
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().optional(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      profilePicture: Joi.string().uri().optional(),
      phoneNumber: Joi.string()
        .pattern(/^[0-9]{10,15}$/) // Accepts numbers only with a length of 10 to 15
        .optional(),
      dob: Joi.date().iso().required(),
      pickupAddress: Joi.string().optional(),
      billingAddress: Joi.string().optional(),
      postalCode: Joi.number().integer().required(),
      lessonsType: Joi.string().optional(),
      instructor: Joi.string().optional(),
      plan: Joi.number().optional(),
      cardDetails: Joi.object({
        cardNo: Joi.string()
          .pattern(/^[0-9]{16}$/) // Accepts exactly 16-digit numbers
          .optional(),
        expiry: Joi.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid date format. Must be in MM/YY format.'),
        cvv: Joi.number().integer().min(100).max(9999).optional(),
        name: Joi.string().optional(),
      }).required(),
    }),
  },
  editDetails: {
    body: Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(8).optional(),
      profilePicture: Joi.string().uri().optional(),
      phoneNumber: Joi.string()
        .pattern(/^[0-9]{10,15}$/) // Accepts numbers only with a length of 10 to 15
        .optional(),
      dob: Joi.date().iso().optional(),
      pickupAddress: Joi.string().optional(),
      billingAddress: Joi.string().optional(),
      postalCode: Joi.number().integer().optional(),
      lessonsType: Joi.string().optional(),
      instructor: Joi.string().optional(),
      plan: Joi.number().optional(),
      cardDetails: Joi.object({
        cardNo: Joi.string()
          .pattern(/^[0-9]{16}$/) // Accepts exactly 16-digit numbers
          .optional(),
        expiry: Joi.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid date format. Must be in MM/YY format.'),
        cvv: Joi.number().integer().min(100).max(9999).optional(),
        name: Joi.string().optional(),
      }).optional(),
    }),
  },

  login: {
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      otp: Joi.string(),
    }),
  },

  logout: {
    body: Joi.object().keys({
      refreshToken: Joi.string().required(),
    }),
  },

  refreshTokens: {
    body: Joi.object().keys({
      refreshToken: Joi.string().required(),
    }),
  },

  forgotPassword: {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
    }),
  },

  resetPassword: {
    body: Joi.object().keys({
      token: Joi.string().required(),
      password: Joi.string().required().custom(password),
    }),
  },

  verifyEmail: {
    query: Joi.object().keys({
      token: Joi.string().required(),
    }),
  },
};

export default pupilValidation;
