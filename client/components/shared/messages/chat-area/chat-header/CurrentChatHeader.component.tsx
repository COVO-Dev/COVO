import { ChevronLeft, MoreHorizontal, Search } from 'lucide-react'

export default function CurrentChatHeader({ activeChat, handleBack, getInitials }) {
  return (
    <div className="bg-base-100 border-b border-gray-300 p-3 flex justify-between items-center relative h-[5em]">
      {activeChat && (
        <button className="md-lg:hidden mr-4 btn btn-ghost btn-sm" onClick={handleBack}>
          <ChevronLeft className="h-6 w-6 text-base-content" />
        </button>
      )}
      <div className="flex items-center">
        <div className={`${activeChat.logo || activeChat.profilePicture ? 'avatar' : ''}  mr-3`}>
          <div className="rounded-full h-14 w-14 bg-base-300 flex items-center justify-center text-gray-700 text-xl ">
            {activeChat ? getInitials(`${activeChat?.firstName} ${activeChat?.lastName}`) : ''}
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-base-content">
            {activeChat
              ? `${activeChat?.firstName} ${activeChat?.lastName}`
              : 'No Chat Selected'}
          </h2>
        </div>
      </div>
      <div className="flex">
        <button className="btn btn-ghost btn-sm rounded-full">
          <Search className="h-5 w-5 text-base-content" />
        </button>
        <button className="btn btn-ghost btn-sm rounded-full">
          <MoreHorizontal className="h-5 w-5 text-base-content" />
        </button>
      </div>
    </div>
  )
}