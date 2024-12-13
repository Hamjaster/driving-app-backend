import mongoose, { Schema } from 'mongoose';
import { toJSON } from './plugins/toJSON.plugin';
import { tokenTypes } from '../config/tokens';
import { token } from 'morgan';

export interface IToken {
  token: string;
  user: string;
  userType: string;
  type: string;
  expires: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      refPath: 'userType', // Dynamic reference based on userType field
    },
    userType: {
      type: String,
      required: true,
      enum: ['pupil', 'instructor', 'admin'], // Valid values for the userType field
    },
    type: {
      type: String,
      enum: [...Object.values(tokenTypes)],
      required: true,
    },
    expires: {
      type: Date,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

export const Token = mongoose.model<IToken>('Token', tokenSchema);
