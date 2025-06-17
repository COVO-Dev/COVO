import mongoose, { Schema } from 'mongoose';
import { IUser, IAdmin } from '../types';
import { User } from './users.models';

// Admin schema - no permissions field
const AdminSchema: Schema = new Schema(
  {},
  {
    timestamps: true,
    discriminatorKey: 'role',
  }
);


const Admin = User.discriminator<IAdmin>('Admin', AdminSchema);

export { Admin };
