import mongoose from 'mongoose';
const { Schema, model, Model } = mongoose;
export interface IBooking extends Document {
  pupilId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  bookingType: 'learnDrive' | 'refresherLearner' | 'testPreparation';
  package: {
    hours: number;
    price: number;
  };
  lessonsType: 'automatic' | 'manual';
  date: Date;
  status: 'pending' | 'accepted' | 'rejected';
  bookingFeeDeducted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    pupilId: { type: mongoose.Types.ObjectId, ref: 'Pupil', required: true },
    instructorId: { type: mongoose.Types.ObjectId, ref: 'Instructor', required: true },
    bookingType: {
      type: String,
      enum: ['learnDrive', 'refresherLearner', 'testPreparation'],
      required: true,
    },
    package: {
      hours: { type: Number, required: true },
      price: { type: Number, required: true },
    },
    lessonsType: { type: String, enum: ['automatic', 'manual'], required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    // bookingFeeDeducted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
