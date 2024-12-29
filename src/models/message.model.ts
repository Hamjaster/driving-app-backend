import mongoose from 'mongoose';
const { Schema, model, Model } = mongoose;

export interface IMessage extends Document {
  senderId: string; // Pupil or Instructor ID
  receiverId: string; // Pupil or Instructor ID
  content: string; // Message content
  timestamp: Date; // Message timestamp
  chatRoomId: string; // Room ID (combination of Pupil ID and Instructor ID)
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatRoomId: { type: String, required: true },
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
