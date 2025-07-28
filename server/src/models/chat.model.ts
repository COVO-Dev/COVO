// ChatroomSchema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IChat } from '../types/index';

const ChatroomSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    status: {
      type: String,
      enum: ['active', 'readOnly', 'cancelled', 'blocked'],
      default: 'active',
    },
    title: { type: String },
    contextType: { type: String, enum: ['campaign', 'pitch', 'offer'], required: true },
    contextRef: { type: Schema.Types.ObjectId, required: true }, // campaignId or offerId
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model<IChat>('ChatRoom', ChatroomSchema);
export { ChatRoom };
