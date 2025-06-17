'use client';
import { Search } from 'lucide-react';

export default function SearchChatList({ chatRooms, handleChatSearch }) {
  return (
    <div className="p-2">
      <div className="flex items-center border border-gray-300 rounded-lg bg-gray-100 px-4">
        <Search className="text-gray-400 h-5 w-5 mr-2" />
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => handleChatSearch(e.target.value)}
          className="input input-ghost w-full focus:outline-none focus:ring-0 bg-gray-100 placeholder-gray-500"
        />
      </div>
    </div>
  )
}