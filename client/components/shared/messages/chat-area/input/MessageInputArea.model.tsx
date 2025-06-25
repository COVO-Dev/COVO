import { Socket } from "socket.io-client";

export default interface IMessageInputArea {
  handleSendMessage: (message: string, files: File[]) => void;
  activeChatId: string;
  token: string;
  socketState: Socket | null;
  id: string;
}