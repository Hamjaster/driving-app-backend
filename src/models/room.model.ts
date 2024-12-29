import mongoose from 'mongoose';
const { Schema, model, Model } = mongoose;

export interface IRoom extends Document {
  pupil: string; // Reference to Pupil
  instructor: string; // Reference to Instructor
  lastMessage: string; // Content of the last message
  lastMessageTimestamp: Date; // Timestamp of the last message
}

const RoomSchema = new Schema<IRoom>({
  pupil: { type: Schema.Types.ObjectId, ref: 'Pupil', required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
  lastMessage: { type: String, default: '' },
  lastMessageTimestamp: { type: Date, default: Date.now },
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
