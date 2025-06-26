import dotenv from "dotenv";
import mongoose from "mongoose";
import { config } from "./config/configuration";
import { createServer } from "http";
import app from "./app";
import { WebSocketServer, WebSocket } from "ws";
import { ChatService } from "./services/chat.service";
import { NotificationService } from "./services/notification.service";
import { ServiceResponse, IMessage } from "./types";
import { Server, Socket } from "socket.io";
import { authorizeSocket } from "./middleware/auth";
import { NextFunction } from "express";
import { startWebSocketServer } from "./socketServer";
import { chatController } from "./routes/chat.routes";

dotenv.config();

const PORT = config.port;
const MAIN_DB_URI = config.MAIN_DB_URI;
const METRICS_DB_URI = config.METRICS_DB_URI;

const metricsDB = mongoose.createConnection(METRICS_DB_URI);

const server = createServer(app);
const { io: ioObject, connectedClients, chatRooms } = startWebSocketServer();

// const wss = new WebSocketServer({ server });
// const chatService = new ChatService();
// const notificationService = new NotificationService();
// const chatRooms = new Map<string, Set<WebSocket>>();
// const connectedClients = new Map<string, WebSocket>();
// const notificationQueue = new Map<string, Array<any>>();

// const handleJoinEvent = async (ws, recipientId) => {
//   if (!recipientId) {
//     ws.send(
//       JSON.stringify({
//         event: "error",
//         message: "Missing recipientId in join message.",
//       })
//     );
//     return;
//   }
//   console.log(`User ${recipientId} joined.`);
//   connectedClients.set(recipientId, ws);
//   if (notificationQueue.has(recipientId)) {
//     notificationQueue.get(recipientId).forEach((notification) => {
//       ws.send(
//         JSON.stringify({ event: "new_notification", data: notification })
//       );
//     });
//     notificationQueue.delete(recipientId);
//   }
// };

// wss.on("connection", (ws) => {
//   console.log("WebSocket connection established 🚀");

//   ws.on("message", async (message: string) => {
//     try {
//       const { event, ...data } = JSON.parse(message);
//       console.log(`Event: ${event}`);
//       const {
//         chatId,
//         senderId,
//         recipientId,
//         content,
//         role,
//         category,
//         type,
//         status,
//         subject,
//         body,
//         media,
//       } = data;

//       if (event === "join") {
//         handleJoinEvent(ws, data.recipientId);
//         return;
//       }

//       if (event === "send_message") {
//         if (!chatId || !senderId || !content) {
//           ws.send(
//             JSON.stringify({
//               event: "error",
//               message: "Missing fields for message.",
//             })
//           );
//           return;
//         }

//         const response = await chatService.sendMessage(
//           chatId,
//           senderId,
//           content
//         );
//         ws.send(
//           JSON.stringify({
//             event: "message_sent",
//             message: response.message,
//             data: response.data,
//           })
//         );

//         const clientsInRoom = chatRooms.get(chatId) || new Set();
//         clientsInRoom.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(
//               JSON.stringify({
//                 event: "new_message",
//                 senderId,
//                 chatId,
//                 message: response.data,
//               })
//             );
//           }
//         });
//         return;
//       }

//       if (event === "send_media") {
//         if (!chatId || !senderId || !media || media.length === 0) {
//           ws.send(
//             JSON.stringify({
//               event: "error",
//               message: "Missing fields for media upload.",
//             })
//           );
//           return;
//         }

//         let response: ServiceResponse<IMessage>;
//         try {
//           response = await chatService.uploadMedia(chatId, senderId, media);
//           ws.send(
//             JSON.stringify({
//               event: "media_uploaded",
//               message: response.message,
//               data: response.data,
//             })
//           );
//         } catch (err) {
//           console.error("Error uploading media:", err);
//           ws.send(
//             JSON.stringify({
//               event: "error",
//               message: `Error uploading media: ${err.message}`,
//             })
//           );
//         }

//         const clientsInRoom = chatRooms.get(chatId) || new Set();
//         clientsInRoom.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(
//               JSON.stringify({
//                 event: "new_media",
//                 senderId,
//                 chatId,
//                 media: Array.isArray(response?.data)
//                   ? null
//                   : response?.data?.media,
//               })
//             );
//           }
//         });
//         return;
//       }

//       if (event === "send_notification") {
//         if (
//           !senderId ||
//           !recipientId ||
//           !role ||
//           !category ||
//           !status ||
//           !subject ||
//           !type ||
//           !body
//         ) {
//           ws.send(
//             JSON.stringify({
//               event: "error",
//               message: "Missing fields for notification.",
//             })
//           );
//           return;
//         }
//         const notificationResponse =
//           await notificationService.createNotification(senderId, recipientId, {
//             role,
//             subject,
//             body,
//             type,
//             category,
//             status,
//           });

//         const recipientClient = connectedClients.get(recipientId);
//         if (recipientClient && recipientClient.readyState === WebSocket.OPEN) {
//           console.log(
//             `Sending notification to recipient ${recipientId} via WebSocket.`
//           );
//           recipientClient.send(
//             JSON.stringify({
//               event: "new_notification",
//               data: notificationResponse.data,
//             })
//           );
//         } else {
//           console.log(
//             `Recipient ${recipientId} is not connected. Queuing notification.`
//           );
//           if (!notificationQueue.has(recipientId)) {
//             notificationQueue.set(recipientId, []);
//           }
//           notificationQueue.get(recipientId)?.push(notificationResponse.data);
//         }
//         return;
//       }
//       ws.send(
//         JSON.stringify({ type: "error", message: "Unknown message event." })
//       );
//     } catch (err) {
//       console.error("Error handling WebSocket message:", err);
//       ws.send(
//         JSON.stringify({
//           type: "error",
//           message: "Invalid message format or server error.",
//         })
//       );
//     }
//   });

//   ws.on("close", () => {
//     const clientId = Array.from(connectedClients.entries()).find(
//       ([key, value]) => value === ws
//     )?.[0];
//     if (clientId) {
//       connectedClients.delete(clientId);
//       console.log(`WebSocket connection closed for client ${clientId}.`);

//       // Remove the client from chat rooms
//       chatRooms.forEach((clients, room) => {
//         if (clients.has(ws)) {
//           clients.delete(ws);
//           console.log(`Removed client ${clientId} from chat room ${room}.`);
//         }
//       });
//     }
//   });
// });

// const io = new Server(server, {
//   cors: {
//     origin: "*", // customize this to match your frontend origin
//     methods: ["GET", "POST"],
//   },
// });

// const chatService = new ChatService();
// const notificationService = new NotificationService();
// const chatRooms = new Map<string, Set<string>>(); // stores socket IDs
// const connectedClients = new Map<string, string>(); // userId => socket.id
// const notificationQueue = new Map<string, Array<any>>();

// io.use((socket: Socket, next: NextFunction) => {
//   authorizeSocket(socket, next);
// });

// io.on("connection", (socket) => {
//   console.log(
//     "Socket.IO connection established 🚀",
//     socket?.id,
//     socket?.decodedUser
//   );

//   const recipientId = socket?.decodedUser._id.toString();
//   connectedClients.set(recipientId, socket.id);
//   // console.log(`User ${recipientId} joined.`, connectedClients);

//   if (notificationQueue.has(recipientId)) {
//     notificationQueue.get(recipientId).forEach((notification) => {
//       socket.emit("new_notification", notification);
//     });
//     notificationQueue.delete(recipientId);
//   }

//   // socket.on("join", (recipientId: string) => {
//   //   if (!recipientId) {
//   //     socket.emit("error", "Missing recipientId in join message.");
//   //     return;
//   //   }

//   //   connectedClients.set(recipientId, socket.id);
//   //   console.log(`User ${recipientId} joined.`, connectedClients);

//   //   if (notificationQueue.has(recipientId)) {
//   //     notificationQueue.get(recipientId).forEach((notification) => {
//   //       socket.emit("new_notification", notification);
//   //     });
//   //     notificationQueue.delete(recipientId);
//   //   }
//   // });

//   socket.on(
//     "send_message",
//     async ({ chatId, senderId, content, recipientId }) => {
//       if (!chatId || !senderId || !content) {
//         socket.emit("error", "Missing fields for message.");
//         console.log("[SOCKET] error: Missing credentials");
//         return;
//       }

//       const response = await chatService.sendMessage(chatId, senderId, content);
//       socket.emit("message_sent", {
//         message: response.message,
//         data: response.data,
//       });
//       console.log(
//         "[SOCKET]",
//         "Message sent",
//         response.data,
//         Array.isArray(response.data) ? "undefined" : typeof response.data.timestamp
//       );

//       if (!chatRooms.has(chatId)) {
//         chatRooms.set(chatId, new Set([socket.id]));
//       } else if (!chatRooms.get(chatId).has(socket.id)) {
//         chatRooms.get(chatId).add(socket.id);
//       }
//       const clientsInRoom = chatRooms.get(chatId);
//       console.log("[SOCKET]", "ChatRooms", chatRooms);
//       clientsInRoom.forEach((clientSocketId) => {
//         // if (clientSocketId === socket.id) return;
//         io.to(clientSocketId).emit("new_message", {
//           // socket.to(clientSocketId).emit("new_message", {
//           senderId,
//           chatId,
//           message: response.data,
//         });
//       });
//     }
//   );

//   socket.on("send_media", async ({ chatId, senderId, media }) => {
//     if (!chatId || !senderId || !media || media.length === 0) {
//       socket.emit("error", "Missing fields for media upload.");
//       return;
//     }

//     try {
//       const response = await chatService.uploadMedia(chatId, senderId, media);
//       socket.emit("media_uploaded", {
//         message: response.message,
//         data: response.data,
//       });

//       const clientsInRoom = chatRooms.get(chatId) || new Set();
//       clientsInRoom.forEach((clientSocketId) => {
//         io.to(clientSocketId).emit("new_media", {
//           senderId,
//           chatId,
//           media: Array.isArray(response?.data) ? null : response?.data?.media,
//         });
//       });
//     } catch (err) {
//       socket.emit("error", `Error uploading media: ${err.message}`);
//     }
//   });

//   socket.on("send_notification", async (payload) => {
//     const {
//       senderId,
//       recipientId,
//       role,
//       subject,
//       body,
//       type,
//       category,
//       status,
//     } = payload;

//     if (
//       !senderId ||
//       !recipientId ||
//       !role ||
//       !category ||
//       !status ||
//       !subject ||
//       !type ||
//       !body
//     ) {
//       socket.emit("error", "Missing fields for notification.");
//       return;
//     }

//     const notificationResponse = await notificationService.createNotification(
//       senderId,
//       recipientId,
//       { role, subject, body, type, category, status }
//     );

//     const recipientSocketId = connectedClients.get(recipientId);
//     if (recipientSocketId) {
//       io.to(recipientSocketId).emit(
//         "new_notification",
//         notificationResponse.data
//       );
//     } else {
//       console.log(`Recipient ${recipientId} not connected. Queuing.`);
//       if (!notificationQueue.has(recipientId)) {
//         notificationQueue.set(recipientId, []);
//       }
//       notificationQueue.get(recipientId)?.push(notificationResponse.data);
//     }
//   });

//   socket.on("join_room", (chatId: string) => {
//     if (!chatRooms.has(chatId)) chatRooms.set(chatId, new Set());
//     chatRooms.get(chatId).add(socket.id);
//     socket.join(chatId);
//   });

//   socket.on("disconnect", () => {
//     const clientId = Array.from(connectedClients.entries()).find(
//       ([_, id]) => id === socket.id
//     )?.[0];

//     if (clientId) {
//       connectedClients.delete(clientId);
//       console.log(`Socket.IO disconnected for client ${clientId}.`);

//       chatRooms.forEach((clients, room) => {
//         if (clients.has(socket.id)) {
//           clients.delete(socket.id);
//           console.log(`Removed client ${clientId} from chat room ${room}.`);
//         }
//       });
//     }
//   });
// });


metricsDB.on("error", (err) => {
	console.error("Metrics database connection error:", err);
	process.exit(1);
  });
  metricsDB.once("open", () => {
	console.log("Connected to metrics database 🚀");
});


mongoose
	.connect(MAIN_DB_URI)
	.then(() => {
		console.log("Connected to Main Database 🚀");
		server.listen(PORT, () => {
			if (ioObject && chatController) {
				chatController.setSocketIO(ioObject, connectedClients, chatRooms);
				console.log("Socket.IO instance injected into ChatController.");
			} else {
				console.error("Failed to inject Socket.IO instance.");
			}

			console.log(`Server started on port ${PORT} 🚀`);
		});
	})
	.catch((err) => {
		console.error("Database connection error:", err);
		process.exit(1);
	});

export { metricsDB };
