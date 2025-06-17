import { MessageCircle } from "lucide-react";
import CurrentChatHeader from "./chat-header/CurrentChatHeader.component";
import MessageInputArea from "./input/MessageInputArea.component";
import MessageArea from "./messages-area/MessageArea.component";


{/* <MessageAreaSection
  activeChat={activeChat}
  handleBack={handleBack}
  getInitials={getInitials}
  messages={messages}
  id={id}
  messagesEndRef={messagesEndRef}
  messageInput={messageInput}
  setMessageInput={setMessageInput}
  handleSendMessage={handleSendMessage}
  className={''}
/> */}


export default function MessageAreaSection({
  activeChat,
  handleBack,
  getInitials,
  messages,
  id,
  messagesEndRef,
  messageInput,
  setMessageInput,
  handleSendMessage,
  className
}: IMessageAreaSection) {
  return (
    <section className={`flex-1 flex flex-col bg-base-200 ${activeChat ? 'flex' : 'hidden md:flex'} ${className}`}>
      {/* Chat header */}
      {
        activeChat ? (
          <>
            <CurrentChatHeader activeChat={activeChat} handleBack={handleBack} getInitials={getInitials} />

            {/* Message area */}
            <MessageArea messages={messages} activeChat={activeChat} id={id} messagesEndRef={messagesEndRef} />

            {/* Message input area */}
            <MessageInputArea
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleSendMessage={handleSendMessage}
              getInitials={getInitials}
            />
          </>
        )
          : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  Select a chat to view messages
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Choose a conversation from the list to get started.
                </p>
              </div>
            </div>
          )
      }

    </section >
  )
}