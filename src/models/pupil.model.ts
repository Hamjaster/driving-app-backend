import mongoose, { Model, model, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { paginate } from './plugins/paginate.plugin.js';
import { toJSON } from './plugins/toJSON.plugin.js';
import { roles } from '../config/roles.js';

export interface IPupil {
  id: string;
  firstName: string;
  lastName: string;
  dob: Date;
  pickupAddress: string;
  billingAddress: string;
  postalCode: number;
  lessonsType: 'automatic' | 'manual';
  instructor: string;
  plan: 1;
  email: string;
  password: string;
  profilePicture?: string;
  phoneNumber?: string;
  bookings: {
    instructorId: string;
    date: Date;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  progressReports: {
    lessonId: string;
    feedback: string;
    date: Date;
    score: number;
  }[];
  ratings: {
    instructorId: string;
    rating: number;
    review: string;
    date: Date;
  }[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  cardDetails: {
    cardNo: string;
    expiry: Date;
    cvv: number;
    name: string;
  };
  isApproved: boolean;
}

export interface IPupilModel extends Model<IPupil> {
  isEmailTaken(email: string, excludeUserId: string): boolean;
  isPasswordMatch(password: string): boolean;
}

const StudentSchema = new Schema<IPupil, IPupilModel>({
  firstName: { type: String, required: true },

  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  phoneNumber: { type: String },
  isApproved: { type: Boolean, default: false },
  dob: Date,
  pickupAddress: String,
  billingAddress: String,
  postalCode: Number,
  lessonsType: String,
  instructor: String,
  plan: Number,
  bookings: [
    {
      instructorId: { type: Schema.Types.ObjectId, ref: 'ADI', required: true },
      date: { type: Date, required: true },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
  ],
  cardDetails: {
    cardNo: String,
    expiry: Date,
    cvv: Number,
    name: String,
  },
  progressReports: [
    {
      lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
      feedback: { type: String },
      date: { type: Date, required: true },
      score: { type: Number },
    },
  ],
  ratings: [
    {
      instructorId: { type: Schema.Types.ObjectId, ref: 'ADI', required: true },
      rating: { type: Number, required: true },
      review: { type: String },
      date: { type: Date, required: true },
    },
  ],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// add plugin that converts mongoose to json
StudentSchema.plugin(toJSON);
StudentSchema.plugin(paginate);

StudentSchema.statics.isEmailTaken = async function (email: string, excludeUserId: string) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

StudentSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// userSchema.pre('save', async function (next) {
//   const user = this;
//   if (user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

export const Pupil = model<IPupil, IPupilModel>('Pupil', StudentSchema);
