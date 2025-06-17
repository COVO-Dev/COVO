import ChatHead from "./chat-head/ChatHead.component";
import IChatListProps from "./ChatList.model";

export default function ChatList({ chatRooms, activeChat, handleChatSelect, isLoading, searchString, token, getInitials, messages }: IChatListProps) {
  // console.log(messages, 'messages');
  const filteredResults = chatRooms.filter((chatRoom) => {
    const participantFullName = String(chatRoom.participants?.firstName + chatRoom.participants?.lastName).toLowerCase();
    return participantFullName.includes(searchString.toLowerCase())
  });
  const chatListContent = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center p-3 rounded-lg">
              <div className="avatar mr-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                  <div className="skeleton w-full h-full rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="skeleton h-6 w-1/2 mb-2 rounded"></div>
                  <div className="skeleton h-4 w-1/4 rounded"></div>
                </div>
                <div className="skeleton h-4 w-3/4 rounded"></div>
              </div>
            </div>
          ))}
        </>
      );
    } else if (!isLoading && chatRooms.length === 0) { //combined else if
      return (
        <div className="m-2 mt-8 flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No chats available yet!</h2>
            <p className="text-gray-500 dark:text-gray-400">Start a new conversation!</p>
          </div>
        </div>
      );
    } else {
      return (
        <>
          {searchString.trim() !== ''
            ? filteredResults.map((chat) => (
              <ChatHead
                key={chat._id}
                chat={chat}
                activeChat={activeChat}
                handleChatSelect={handleChatSelect}
                getInitials={getInitials}
                token={token}
                messages={messages.get(chat._id)?.slice(-1).content[0]} // Get the last message
              />
            ))
            : chatRooms.map((chat) => (
              <ChatHead
                key={chat._id}
                chat={chat}
                activeChat={activeChat}
                handleChatSelect={handleChatSelect}
                getInitials={getInitials}
                token={token}
                messages={messages.get(chat._id)?.slice(-1)[0]} // Get the last message
              />
            ))}
        </>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-2">
        {chatListContent()}
      </div>
    </div>
  );
}
