"use client";
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
// import { ChevronLeft } from 'lucide-react';
import { getAllChatRoomsForUser } from '@/lib/api/chat/getAllChatRoomsForUser';
import { useSession } from 'next-auth/react';
import ChatList from './sidebar/chat-list/ChatList.component';
import SearchChatList from './sidebar/search/SearchChatList.component';
import ChatHeader from './sidebar/header/ChatHeader.component';
import { io, Socket } from "socket.io-client";
import { getAllMessagesInChatRoom } from '@/lib/api/chat/getAllMessagesInChatRoom';
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Search, Users, Send, Smile, Paperclip, MoreHorizontal, MessageCircle } from 'lucide-react';
import CurrentChatHeader from './chat-area/chat-header/CurrentChatHeader.component';
import MessageArea from './chat-area/messages-area/MessageArea.component';
import MessageInputArea from './chat-area/input/MessageInputArea.component';
import MessageAreaSection from './chat-area/MessageAreaSection.component';
import { chatUploadPhoto } from '@/lib/api/upload/chat-upload-photo/chatUploadPhoto.route';

export default function ChatPage() {
  const { data } = useSession();
  const token = data?.user?.access_token;
  const id = data?.user?._id;
  const [activeChat, setActiveChat] = useState(''); // '' for chat list, chat name for chat
  const [isLoading, setIsLoading] = useState(true);
  const [imageURL, setImageURL] = useState<Map<string, string>>(new Map());
  const [chatRooms, setChatRooms] = useState([]);
  const [searchString, setSearchString] = useState<string>('');
  const [messages, setMessages] = useState<Map<string, string[]>>(new Map());
  const [socketState, setSocketState] = useState<Socket | null>(null);
  // const [chatHeadList, setChatHeadList] = useState([]);

  // console.log(process.env.SERVER_URL);
  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef(null);
  const [showNotification, setShowNotification] = useState(true);

  // const activeMessages = chats.find(chat => chat.name === activeChat)?.messages || [];
  const scrollToBottom = (smoothScroll = false) => {
    if (smoothScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      messagesEndRef.current?.scrollIntoView();
    }
  };


  useEffect(() => {
    if (token && id) {
      const socket = io('http://localhost:8080', {
        auth: {
          token,
        },
      });
      setSocketState(socket);
      socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      const getAllChatRooms = async (token: string, id: string) => {
        try {
          const response = await getAllChatRoomsForUser(token, id);
          const newMap = new Map();
          if (response.status === 'success') {
            const chatRoomListUnfiltered = response.data.data;
            const chatRoomList = chatRoomListUnfiltered.map((chatRoom) => {
              const chatRoomMembers = chatRoom.participants;
              chatRoom.participants = (chatRoomMembers.filter((member) => member._id !== id))[0];
              newMap.set(chatRoom.participants?._id,
                chatRoom.participants?.profilePicture
                  ? chatRoom.participants?.profilePicture
                  : chatRoom.participants?.logo);
              return chatRoom;
            });
            setImageURL(newMap);
            setChatRooms(chatRoomList); //  Update the chatRooms state
          }
        } catch (error) {
          console.error('Error fetching chat rooms:', error);
          //  Handle the error appropriately (e.g., show a message to the user)
        } finally {
          setIsLoading(false); //  This will now execute *after* setChatRooms
        }
      };

      getAllChatRooms(token, id); // Call the function

    }
  }, [token, id]);


  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  useEffect(() => {
    if (activeChat && socketState) {
      const chatId = activeChat.chatId;
      socketState?.emit('join_room', chatId);
      console.log('Joining room:', chatId, activeChat);
    }
    return () => {

    }
  }, [activeChat, socketState]);

  //useEfect v3
  useEffect(() => {
    if (!socketState) return;

    const handleNewMessage = ({ message }) => {
      console.log('Message received:', message);

      setMessages(prev => {
        const existingMessages = prev.get(message.chatId) || [];
        const updatedMessages = [...existingMessages, message];
        const newMap = new Map(prev);
        newMap.set(message.chatId, updatedMessages);
        return newMap;
      });

      // Scroll only if current chat is open
      if (activeChat?.chatId === message.chatId) {
        scrollToBottom(true);
      }
    };

    socketState.on('new_message', handleNewMessage);
    console.log('useEffect ')

    return () => {
      socketState.off('new_message', handleNewMessage);
    };
  }, [socketState]);

  // console.log(messages);

  const handleSendMessage = async (messageContent: string, filesContent: File[]) => {
    if (!socketState) {
      console.error('Socket not initialized');
      toast({
        title: "Error",
        description: "Socket not initialized",
        variant: "destructive",
      });
      return;
    }

    console.log(messageContent, 'handleSendMessage');
    if (!filesContent || filesContent.length === 0) {
      socketState?.emit('send_message', {
        chatId: activeChat.chatId,
        senderId: id,
        content: messageContent,
        // content: e.target.value,
        recipientId: activeChat._id,
      });
    } else {
      const fileResponse = await chatUploadPhoto(token, {
        mediaFiles: filesContent,
        chatId: activeChat.chatId,
        senderId: id,
        messageContent: messageContent,
      })

    }

    // const updatedMessages = messages.get(activeChat.chatId);
    // updatedMessages.push(messageInput);
    // const newMap = new Map(messages);
    // newMap.set(activeChat.chatId, updatedMessages);
    // setMessages(newMap);

    setMessageInput('');
    // const result = await getAllMessagesInChatRoom(token, activeChat.chatId);
    // if (result.status === 'success') {
    //   const messageResult = result.data.data;
    // }
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    let initials = '';
    if (names.length > 0 && names[0]) {
      initials += names[0][0].toUpperCase();
    }
    if (names.length > 1 && names[1]) {
      initials += names[1][0].toUpperCase();
    }
    return initials;
  };

  // Function to handle chat selection.
  const handleChatSelect = async (currentChat: IActiveChat, token: string) => {
    const result = await getAllMessagesInChatRoom(token, currentChat.chatId);
    setActiveChat(currentChat);

    if (result.status === 'success') {
      const messageResult = result.data.data;
      const newMap = new Map(messages);
      newMap.set(currentChat.chatId, messageResult);
      setMessages(newMap);
    } else if (result.status === 'not found') {
      const newMap = new Map(messages);
      newMap.set(currentChat.chatId, []);
      // console.log(newMap)
      setMessages(newMap);
    } else {
      console.log('error');
    }

  };

  // Function to handle back button.
  const handleBack = () => {
    setActiveChat('');
  };

  const handleChatSearch = (searchValue: string) => {
    setSearchString(searchValue);
  };

  return (
    <div className="grid grid-cols-1 md-lg:grid-cols-3 lg:grid-cols-5 lg-xl:grid-cols-7 h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-base-200 ">
      {/* Left sidebar (Chat list) */}
      <aside className={`
      bg-base-100 border-r border-gray-300 flex-col w-full col-span-1 md-sm:col-span-1 md-lg:col-span-1 lg:col-span-2 lg-xl:col-span-2
      ${activeChat ? 'hidden md-lg:flex w-full ' : 'flex w-full'}

      `}>
        {/* Header */}
        <ChatHeader />

        {/* Search */}
        <SearchChatList handleChatSearch={handleChatSearch} />

        {/* Tabs */}
        {/* You might use a <div className="tabs"> here if you have tabs */}

        {/* Notification */}
        {/* {showNotification && (
      <div className="alert alert-info">
        <span>New notification!</span>
      </div>
    )} */}

        {/* chat list */}
        <ChatList
          chatRooms={chatRooms}
          activeChat={activeChat}
          handleChatSelect={handleChatSelect}
          isLoading={isLoading}
          searchString={searchString}
          token={token}
          getInitials={getInitials}
          messages={messages}
        />
      </aside>

      {/* Main chat area */}
      <section className={`flex flex-col bg-base-200 ${activeChat ? 'flex' : 'hidden md-sm:hidden md-lg:flex'} col-span-1 max-h-[calc(100vh-64px)] md-lg:col-span-2 lg:col-span-3 lg-xl:col-span-5 `}>

        {activeChat ? (
          <>
            {/* Chat header */}
            <CurrentChatHeader
              activeChat={activeChat}
              handleBack={handleBack}
              getInitials={getInitials}
            />

            {/* Message area */}
            <MessageArea
              messages={messages}
              activeChat={activeChat}
              id={id}
              messagesEndRef={messagesEndRef}
            />

            {/* Message input area */}
            <MessageInputArea
              handleSendMessage={handleSendMessage}
              socketState={socketState}
              activeChatId={activeChat?.chatId}
              token={token}
              id={id}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {/* Added padding for responsiveness */}
            <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                Select a chat to view messages
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 sm:text-sm">
                Choose a conversation from the list to get started.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>


    // <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-base-200 ">
    //   {/* Left sidebar (Chat list) */}
    //   <aside className="bg-base-100 border-r border-base-300 flex-col hidden md:flex w-full md:w-1/3">
    //     {/* Header */}
    //     <ChatHeader />

    //     {/* Search */}
    //     <SearchChatList handleChatSearch={handleChatSearch} />

    //     {/* Tabs */}
    //     {/* You might use a <div className="tabs"> here if you have tabs */}

    //     {/* Notification */}
    //     {/* {showNotification && (
    //       <div className="alert alert-info">
    //         <span>New notification!</span>
    //       </div>
    //     )} */}

    //     {/* chat list */}
    //     <ChatList
    //       chatRooms={chatRooms}
    //       activeChat={activeChat}
    //       handleChatSelect={handleChatSelect}
    //       isLoading={isLoading}
    //       searchString={searchString}
    //       token={token}
    //     />
    //   </aside>

    //   {/* Main chat area */}
    //   <section className={`flex-1 flex flex-col bg-base-200 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
    //     {
    //       activeChat ? (
    //         <>
    //           <CurrentChatHeader activeChat={activeChat} handleBack={handleBack} getInitials={getInitials} />

    //           <MessageArea messages={messages} activeChat={activeChat} id={id} messagesEndRef={messagesEndRef} />

    //           <MessageInputArea
    //             messageInput={messageInput}
    //             setMessageInput={setMessageInput}
    //             handleSendMessage={handleSendMessage}
    //             getInitials={getInitials}
    //           />
    //         </>
    //       )
    //         : (
    //           <div className="flex-1 flex flex-col items-center justify-center">
    //             <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
    //             <div className="text-center">
    //               <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
    //                 Select a chat to view messages
    //               </h2>
    //               <p className="text-gray-500 dark:text-gray-400 mt-2">
    //                 Choose a conversation from the list to get started.
    //               </p>
    //             </div>
    //           </div>
    //         )
    //     }
    //   </section >

    // </div >

  )


}