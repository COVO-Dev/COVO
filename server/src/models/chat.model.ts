// ChatroomSchema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IChat } from '../types/index';

const ChatroomSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model<IChat>('ChatRoom', ChatroomSchema);
export { ChatRoom };
