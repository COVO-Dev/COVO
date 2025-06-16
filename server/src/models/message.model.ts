import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../types/index';

const MessageSchema: Schema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    media: [
      {
        url: { type: String },
        // type: { type: String, enum: ["image", "video"]},
        type: { type: String, enum: ["image", "video", "document"] },
      },
    ],
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, timestamp: 1 });
MessageSchema.index({ sender: 1 });

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export { Message };
