import Image from "next/image";
import IMessageArea from "./MessageArea.model";
import { Folder, Download } from "lucide-react";


export default function MessageArea({ messages, activeChat, id, messagesEndRef }: IMessageArea) {
  return (
    <div className="flex-1 p-4 overflow-y-scroll space-y-4  ">
      {messages.get(activeChat?.chatId)?.map((message) => (
        <div
          key={message._id}
          className={`chat ${message.sender === id ? 'chat-end' : 'chat-start'}`}
        >
          <div
            className={`chat-bubble ${message.sender === id
              ? 'chat-bubble-neutral'
              : 'bg-base-300 text-base-content'
              } max-w-[460px]`}
          >

            {
              message.content && <p className="whitespace-pre-wrap break-words ">{message.content}</p>
            }
            {
              message.media && message.media.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {
                    message.media.map((media, _id) => {
                      // Check if media is a string or an object
                      console.log(media, media.type);

                      return (<div key={_id} className="rounded-md overflow-hidden">
                        {
                          media.type === 'video' ? (
                            <video
                              key={_id}
                              controls
                              className="w-full h-auto rounded-lg"
                            >
                              <source src={media.url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) :
                            media.type === 'document' ? (
                              <div className="card flex flex-row justify-between border-2 border-base-200 pr-6 hover:bg-base-200 transition-all duration-200 ease-in-out hover:text-black hover:border-black ">
                                {/* <span className="flex flex-row items-center gap-4">
                                  <Folder className="w-10 h-10 text-gray-500" />
                                </span> */}
                                <a
                                  key={_id}
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-row items-center gap-4 text-lg"
                                >
                                  <Download className="w-6 h-6  ml-2" />
                                  Download file
                                </a>
                              </div>
                            ) :
                              (
                                <Image
                                  key={_id}
                                  height={300}
                                  width={300}
                                  src={media.url}
                                  alt={`Message media`}
                                  className="w-full h-auto rounded-lg"
                                />
                              )
                        }
                      </div>
                      )
                    })
                  }
                </div>
              )
            }
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}


// {message.image && (
//   <div className="rounded-lg overflow-hidden">
//     {/* Use a more generic class, and set width/height */}
//     <div className="w-40 h-40 bg-base-200 flex items-center justify-center text-base-content">
//       [Product Image]
//     </div>
//   </div>
// )}