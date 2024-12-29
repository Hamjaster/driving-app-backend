import mongoose from 'mongoose';
const { Schema, model, Model } = mongoose;
import { toJSON } from './plugins/toJSON.plugin.js';
import { paginate } from './plugins/paginate.plugin.js';
import { IPupil } from './pupil.model.js';
import { IInstructor } from './instructor.model.js';
import { IBooking } from './booking.model.js';

export interface IPayment extends Document {
  id: string;
  pupil: IPupil;
  instructor: IInstructor;
  booking?: IBooking;
  amount: number;
  paymentDate: Date;
  paymentStatus: string;
}

const PaymentSchema = new Schema({
  pupil: {
    type: Schema.Types.ObjectId,
    ref: 'Pupil',
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  //   paymentType : {
  //     type  : String,
  //     enum : ['Stripe', 'Paypal'],
  //   }
});

// add plugin that converts mongoose to json
PaymentSchema.plugin(toJSON);
PaymentSchema.plugin(paginate);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
