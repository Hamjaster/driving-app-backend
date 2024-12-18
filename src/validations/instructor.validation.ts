import Joi from 'joi';

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required().messages({
    'any.only': 'Status must be either "accepted" or "rejected"',
    'any.required': 'Status is required',
  }),
});
