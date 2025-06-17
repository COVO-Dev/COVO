export default interface IChatListProps {
  chatRooms: IChatRoom[];
  activeChat: IActiveChat;
  searchString: string;
  isLoading: boolean;
  token: string;
  handleChatSelect: (activeChat: IActiveChat, token: string) => void;
  getInitials: (name: string) => string;
  getAvatar: (avatar: string) => string;
}