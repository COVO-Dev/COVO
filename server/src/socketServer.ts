import dotenv from "dotenv";
import mongoose from "mongoose";
import { config } from "./config/configuration";
import app from "./app";
import { ChatService } from "./services/chat.service";
import { NotificationService } from "./services/notification.service";
import { ServiceResponse, IMessage } from "./types";
import { authorizeSocket } from "./middleware/auth";
import { NextFunction } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

dotenv.config();

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080;

export const startWebSocketServer = () => {
  const httpServer = createServer();

  // const io = new Server(httpServer, {
  //   cors: {
  //     origin: process.env.FRONTEND_URL || '*', // Allow CORS for the frontend
  //   },
  // });

  // // Middleware for socket authorization
  // io.use((socket, next) => {
  //   authorizeSocket(socket, next);
  // });

  // // Handle socket connections
  // io.on('connection', (socket) => {
  //   console.log('A client connected:', socket.id);

  //   socket.on('disconnect', () => {
  //     console.log('A client disconnected:', socket.id);
  //   });

  //   // Add your custom event handlers here
  //   socket.on('exampleEvent', (data) => {
  //     console.log('Received exampleEvent:', data);
  //   });
  // });



  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*", // customize this to match your frontend origin
      methods: ["GET", "POST"],
    },
  });

  const chatService = new ChatService();
  const notificationService = new NotificationService();
  const chatRooms = new Map<string, Set<string>>(); // stores socket IDs
  const connectedClients = new Map<string, string>(); // userId => socket.id
  const notificationQueue = new Map<string, Array<any>>();

  io.use((socket: Socket, next: NextFunction) => {
    authorizeSocket(socket, next);
  });

  io.on("connection", (socket) => {
    console.log(
      "Socket.IO connection established 🚀",
      socket?.id,
      socket?.decodedUser
    );

    const recipientId = socket?.decodedUser._id.toString();
    connectedClients.set(recipientId, socket.id);
    // console.log(`User ${recipientId} joined.`, connectedClients);

    if (notificationQueue.has(recipientId)) {
      notificationQueue.get(recipientId).forEach((notification) => {
        socket.emit("new_notification", notification);
      });
      notificationQueue.delete(recipientId);
    }

    // socket.on("join", (recipientId: string) => {
    //   if (!recipientId) {
    //     socket.emit("error", "Missing recipientId in join message.");
    //     return;
    //   }

    //   connectedClients.set(recipientId, socket.id);
    //   console.log(`User ${recipientId} joined.`, connectedClients);

    //   if (notificationQueue.has(recipientId)) {
    //     notificationQueue.get(recipientId).forEach((notification) => {
    //       socket.emit("new_notification", notification);
    //     });
    //     notificationQueue.delete(recipientId);
    //   }
    // });


    // // when a user joins a chat room
    // socket.on("join", (chatId: string) => {
    //   if (!chatId) {
    //     socket.emit("error", "Missing chatId in join message.");
    //     return;
    //   }

    //   console.log(`Room ${chatId} accessed.`, chatRooms);

    //   if (!chatRooms.has(chatId)) {
    //     chatRooms.set(chatId, new Set([socket.id]));
    //   } else if (!chatRooms.get(chatId).has(socket.id)) {
    //     chatRooms.get(chatId).add(socket.id);
    //   }
    // });

    socket.on("join_room", (chatId: string) => {
      if (!chatRooms.has(chatId)) chatRooms.set(chatId, new Set());
      chatRooms.get(chatId).add(socket.id);
      console.log(`Room ${chatId} accessed. ${socket.id} socket joined.`);
      socket.join(chatId);
    });

    socket.on(
      "send_message",
      async ({ chatId, senderId, content, recipientId }) => {
        if (!chatId || !senderId || !content) {
          socket.emit("error", "Missing fields for message.");
          console.log("[SOCKET] error: Missing credentials");
          return;
        }

        const response = await chatService.sendMessage(chatId, senderId, content);
        socket.emit("message_sent", {
          message: response.message,
          data: response.data,
        });
        console.log(
          "[SOCKET]",
          "Message sent",
          response.data,
          Array.isArray(response.data) ? "undefined" : typeof response.data.timestamp
        );

        const sockets = await io.in(chatId).fetchSockets();
        sockets.forEach((clientSocket) => {
          console.log(
            "[SOCKET]",
            "Client socket ID:",
            clientSocket.id
          )})

        console.log(socket.rooms)

        // socket.to(chatId).emit('new_message', {
        io.to(chatId).emit('new_message', {
            senderId,
            chatId,
            message: response.data,
        })

      }
    );

    socket.on("send_media", async ({ chatId, senderId, media }) => {
      if (!chatId || !senderId || !media || media.length === 0) {
        socket.emit("error", "Missing fields for media upload.");
        return;
      }

      try {
        const response = await chatService.uploadMedia(chatId, senderId, media);
        socket.emit("media_uploaded", {
          message: response.message,
          data: response.data,
        });

        const clientsInRoom = chatRooms.get(chatId) || new Set();
        clientsInRoom.forEach((clientSocketId) => {
          io.to(clientSocketId).emit("new_media", {
            senderId,
            chatId,
            media: Array.isArray(response?.data) ? null : response?.data?.media,
          });
        });
      } catch (err) {
        socket.emit("error", `Error uploading media: ${err.message}`);
      }
    });

    socket.on("send_notification", async (payload) => {
      const {
        senderId,
        recipientId,
        role,
        subject,
        body,
        type,
        category,
        status,
      } = payload;

      if (
        !senderId ||
        !recipientId ||
        !role ||
        !category ||
        !status ||
        !subject ||
        !type ||
        !body
      ) {
        socket.emit("error", "Missing fields for notification.");
        return;
      }

      const notificationResponse = await notificationService.createNotification(
        senderId,
        recipientId,
        { role, subject, body, type, category, status }
      );

      const recipientSocketId = connectedClients.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit(
          "new_notification",
          notificationResponse.data
        );
      } else {
        console.log(`Recipient ${recipientId} not connected. Queuing.`);
        if (!notificationQueue.has(recipientId)) {
          notificationQueue.set(recipientId, []);
        }
        notificationQueue.get(recipientId)?.push(notificationResponse.data);
      }
    });

    socket.on("disconnect", () => {
      const clientId = Array.from(connectedClients.entries()).find(
        ([_, id]) => id === socket.id
      )?.[0];

      if (clientId) {
        connectedClients.delete(clientId);
        console.log(`Socket.IO disconnected for client ${clientId}.`);

        chatRooms.forEach((clients, room) => {
          if (clients.has(socket.id)) {
            clients.delete(socket.id);
            console.log(`Removed client ${clientId} from chat room ${room}.`);
          }
        });
      }
    });
  });


  // Start the WebSocket server
  httpServer.listen(WEBSOCKET_PORT, () => {
    console.log(`WebSocket server is running on port ${WEBSOCKET_PORT}`);
  });

  return { io, chatRooms, connectedClients };
};

