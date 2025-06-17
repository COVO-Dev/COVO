export default interface IMessageArea {
  messages: Map<string, IMessage[]>;
  activeChat: IActiveChat;
  id: string
  messagesEndRef: React.RefObject<HTMLDivElement>
}