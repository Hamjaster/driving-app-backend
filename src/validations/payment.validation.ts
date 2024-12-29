import Joi from 'joi';

const paymentValidations = {
  payForBooking: {
    body: Joi.object().keys({
      bookingId: Joi.string().required(),
    }),
  },
  quickPayment: {
    body: Joi.object().keys({
      amount: Joi.number().required(),
      instructorId: Joi.string().required(),
    }),
  },
  confirmPayment: {
    body: Joi.object().keys({
      paymentId: Joi.string().required(),
    }),
  },
};

export default paymentValidations;
