export default interface IChatSlice {
  socket: any;
  chatRooms: IChatRoom[];
  messages: IMessage[];
  selectedUser: string | null;
  activeChat: string;
  onlineUsers: string[];
}
