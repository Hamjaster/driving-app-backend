import mongoose from 'mongoose';
const { Schema, model, Model } = mongoose;
import { toJSON } from './plugins/toJSON.plugin.js';
import { paginate } from './plugins/paginate.plugin.js';

export interface IInstructor extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  availability: {
    start: Date;
    end: Date;
  }[]; // An array of dates showing availability
  profilePicture?: string;
  phoneNumber?: string;
  postalCode: number;
  ratings: {
    pupilId: string;
    rating: number;
    review: string;
    date: Date;
  }[];
  packages: {
    packageId: string;
    price: number;
    hours: number;
  }[];
}

const InstructorSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  postalCode: { type: Number, required: true },
  availability: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  ],
  profilePicture: { type: String },
  phoneNumber: { type: String },
  ratings: [
    {
      pupilId: { type: Schema.Types.ObjectId, ref: 'Pupil' },
      rating: { type: Number, required: true },
      review: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  packages: [
    {
      packageId: { type: String, required: true },
      price: { type: Number, required: true },
      hours: { type: Number, required: true },
    },
  ],
});

// add plugin that converts mongoose to json
InstructorSchema.plugin(toJSON);
InstructorSchema.plugin(paginate);

InstructorSchema.statics.isEmailTaken = async function (email: string, excludeUserId: string) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

export const Instructor = mongoose.model<IInstructor>('Instructor', InstructorSchema);
