import Joi from 'joi';

const paymentValidations = {
  payInstructor: {
    body: Joi.object().keys({
      amount: Joi.number().required(),
      pupilId: Joi.string().required(),
      instructorId: Joi.string().required(),
      courseId: Joi.string().required(),
    }),
  },
};
