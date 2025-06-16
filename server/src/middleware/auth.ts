import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/users.models';
import { Deactivation } from '../models/deactivation.models'; // Ensure this model exists and is imported
import { UserRole } from '../types/enum';
import { AuthenticatedRequest } from '../types';
import { Socket } from "socket.io";

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status_code: '401',
        success: false,
        message: 'Authorization token is missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);

    if (!token) {
      return res.status(401).json({
        status_code: '401',
        success: false,
        message: 'Token is missing',
      });
    }

    const secretKey = process.env.SECRET_TOKEN;
    if (!secretKey) {
      throw new Error('JWT secret key is not configured');
    }

    const decoded = jwt.verify(token, secretKey) as { id: string; role: UserRole[] };

    const { id } = decoded;
    console.log('Decoded Payload:', decoded);
    console.log('Token ID:', id);

    if (!id) {
      return res.status(401).json({
        status_code: '401',
        success: false,
        message: 'Invalid token: Missing user ID.',
      });
    }

    console.log(`Querying user with ID: ${id}`);

    // Try finding the user in the User model
    let user = await User.findById(new mongoose.Types.ObjectId(id));

    if (user) {
      // Attach active user data to request
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
      return next();
    }

    // If user not found, check the Deactivation model
    const deactivatedUser = await Deactivation.findOne({ userId: id });
    if (deactivatedUser) {
      // Attach deactivated user data to request
      req.user = {
        userId: deactivatedUser.userId.toString(),
        email: deactivatedUser.userData.email,
        role: deactivatedUser.userData.role,
        firstName: deactivatedUser.userData.firstName,
        lastName: deactivatedUser.userData.lastName
      };
      return next();
    }

    // If user is neither active nor deactivated
    return res.status(401).json({
      status_code: '401',
      success: false,
      message: 'User not found or invalid token',
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Authorization Middleware Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('Authentication required');
  }
  next();
};

export const authorizeSocket = async (socket: Socket, next: NextFunction) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Token is missing"));
  }

  const secretKey = process.env.SECRET_TOKEN;
  if (!secretKey) {
    return next(new Error("JWT secret key is not configured"));
  }

  const decoded = jwt.verify(token, secretKey) as {
    id: string;
    role: UserRole[];
  };

  const { id } = decoded;
  console.log("[ Socket ] Decoded Payload:", decoded);
  console.log("[ Socket ] Token ID:", id);

  if (!id) return next(new Error("Invalid token: Missing user ID."));

  console.log(`[ SOCKET ] Querying user with ID: ${id}`);

  let user = await User.findById(new mongoose.Types.ObjectId(id)).select(
    "_id firstName lastName role "
  );

  if (user) {
    // Attach active user data to socket object
    socket.decodedUser = user;
    return next();
  }

  // // If user not found, check the Deactivation model
  // const deactivatedUser = await Deactivation.findOne({ userId: id });
  // if (deactivatedUser) {
  //   // Attach deactivated user data to request
  //   req.user = {
  //     userId: deactivatedUser.userId.toString(),
  //     email: deactivatedUser.userData.email,
  //     role: deactivatedUser.userData.role,
  //     firstName: deactivatedUser.userData.firstName,
  //     lastName: deactivatedUser.userData.lastName,
  //   };
  //   return next();
  // }

  return next(new Error("User not found or invalid token"));
};
