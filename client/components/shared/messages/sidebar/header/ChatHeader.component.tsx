export default function ChatHeader() {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-300 h-[5em]" >
      <h1 className="text-xl font-semibold">Chats</h1>
      <div className="flex">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 010-2h3V6a1 1 0 011-1z" />
          </svg>
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div >
  )
}