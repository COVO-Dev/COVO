import IChatHeadProps from "./ChatHead.model";

export default function ChatHead({ chat, activeChat, handleChatSelect, getInitials, token, messages }: IChatHeadProps) {
  // console.log(messages);
  return (
    // <div
    //   key={chat._id}
    //   className={`flex items-center px-3 py-2 cursor-pointer ${activeChat.chatId === chat._id ? 'bg-gray-200' : 'hover:bg-blue-50'}`}
    //   onClick={() => handleChatSelect({ ...chat.participants, chatId: chat._id }, token)}
    // >
    //   <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-300 mr-3 relative">
    //     {/* Avatar placeholder - in a real app you'd use next/image */}
    //     <div className="h-full w-full rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white">
    //       {chat.avatar ? (
    //         <div className="h-full w-full bg-gray-300 flex items-center justify-center">
    //           {/* {chat.name.charAt(0)} */}
    //           {chat.participants.firstName.charAt(0)}
    //         </div>
    //       ) : (
    //         getInitials(`${chat.participants.firstName} ${chat.participants.lastName} `)
    //       )}
    //     </div>
    //   </div>
    //   <div className="flex-1 min-w-0">
    //     <div className="flex justify-between">
    //       <h3 className="text-sm font-medium truncate">{`${chat.participants.firstName} ${chat.participants.lastName}`}</h3>
    //       {/* <span className="text-xs text-gray-500">{chat.lastMessage?.timestamp.toLocaleString('en-US', {date:'short' })}</span> */}
    //       <span className="text-xs text-gray-500">{typeof (chat.lastMessage?.timestamp)}</span>
    //     </div>
    //     <div className="flex items-center border-2 border-red-500">
    //       {/* {chat.name === 'صيدلية ايرام' && (
    //         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
    //           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //         </svg>
    //       )} */}
    //       <p className="text-sm text-gray-500 truncate max-w-[70%]">{chat.lastMessage?.content}</p>
    //       {chat.lastMessage && (
    //         <span className="ml-auto flex-shrink-0 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
    //           {chat.unread}
    //         </span>
    //       )}
    //     </div>
    //   </div>
    // </div>
    <div
      key={chat._id}
      className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors duration-200 ${activeChat?.chatId === chat._id ? 'bg-base-300' : 'hover:bg-base-200'}`}
      onClick={() => handleChatSelect({ ...chat.participants, chatId: chat._id }, token)}
    >
      <div className="mr-4">
        {/* <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-black"> */}
        <div className={`${chat.participants?.logo || chat.participants?.profilePicture ? 'avatar' : ''} w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex flex-row items-center justify-center text-gray-700 `}>
          {chat.participants ? (
            getInitials(`${chat.participants.firstName} ${chat.participants.lastName}`)
          ) : (
            '?'
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white">
            {chat.participants
              ? `${chat.participants.firstName} ${chat.participants.lastName}`
              : 'Unknown Chat'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {chat.lastMessage?.timestamp
              ? (function () {
                const now = Date.now();
                const messageDate = new Date(chat.lastMessage.timestamp);
                const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

                if (diffInDays === 0) {
                  // Today: Display time
                  return messageDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                } else if (diffInDays === 1) {
                  // Yesterday
                  return 'Yesterday';
                } else if (diffInDays < 7) {
                  //Within a week
                  return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
                }
                else {
                  // More than 48 hours ago: Display full date
                  return messageDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                }
              })()
              : ''}
          </span>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500 truncate max-w-[80%] dark:text-gray-400">
            {/* {chat.lastMessage?.content || 'No messages yet'} */}
            {/* {activeChat
              ? messages?.content
              : chat.lastMessage?.content
            } */}
            {messages?.content ?? chat.lastMessage?.content}
          </p>
          {chat.unread > 0 && (
            <span className="badge badge-primary ml-2">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}