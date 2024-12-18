import Joi, { expression } from 'joi';

const bookingValidations = {
  createBooking: Joi.object({
    instructorId: Joi.string().required().messages({
      'string.empty': 'Instructor ID is required',
      'any.required': 'Instructor ID is required',
    }),
    bookingType: Joi.string().valid('learnDrive', 'refresherLearner', 'testPreparation').required().messages({
      'any.only': 'Booking type must be one of [learnDrive, refresherLearner, testPreparation]',
      'any.required': 'Booking type is required',
    }),
    package: Joi.object({
      hours: Joi.number().integer().positive().required().messages({
        'number.base': 'Package hours must be a number',
        'number.positive': 'Package hours must be a positive number',
        'any.required': 'Package hours are required',
      }),
      price: Joi.number().positive().required().messages({
        'number.base': 'Package price must be a number',
        'number.positive': 'Package price must be positive',
        'any.required': 'Package price is required',
      }),
    })
      .required()
      .messages({
        'any.required': 'Package details are required',
      }),
    lessonsType: Joi.string().valid('automatic', 'manual').required().messages({
      'any.only': 'Lessons type must be one of [automatic, manual]',
      'any.required': 'Lessons type is required',
    }),
    date: Joi.date().iso().required().messages({
      'date.base': 'Invalid date format',
      'any.required': 'Date is required',
    }),
  }),
};

export default bookingValidations;
