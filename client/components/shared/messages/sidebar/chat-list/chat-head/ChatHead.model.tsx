import IChatListProps from "../ChatList.model";

export default interface IChatHeadProps extends IChatListProps {
  chat: IChatRoom;
}