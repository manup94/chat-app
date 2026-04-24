"use client"

import ChatWindow from "../chat-window"
import UsersList from "../friends-list"
import { useState, useEffect } from "react"
import { Friend } from "@/models/interfaces/friend"
import { Menu, X } from "lucide-react"
import { Session } from "next-auth"
import { Message } from "@/models/interfaces/message"

interface HomeWrapperProps {
  initialSession: Session
}

export const HomeWrapper = ({ initialSession }: HomeWrapperProps) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends`, {
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch friends")
      }

      const data = await res.json()
      setFriends(data)

      setSelectedFriend((currentSelectedFriend) => {
        if (!currentSelectedFriend) return currentSelectedFriend

        const updatedSelectedFriend = data.find(
          (friend: Friend) => friend.id === currentSelectedFriend.id
        )

        return updatedSelectedFriend ?? null
      })
    } catch (err) {
      console.error("Error fetching friends:", err)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleConversationActivity = (message: Message) => {
    const friendId =
      message.senderId === initialSession.user?.id
        ? message.receiverId
        : message.senderId

    setFriends((currentFriends) => {
      const updatedFriends = currentFriends.map((friend) =>
        friend.id === friendId
          ? {
              ...friend,
              lastMessage: message.content,
              lastActivityAt: message.timestamp,
            }
          : friend
      )

      const activeFriend = updatedFriends.find((friend) => friend.id === friendId)
      const otherFriends = updatedFriends.filter((friend) => friend.id !== friendId)

      return activeFriend ? [activeFriend, ...otherFriends] : updatedFriends
    })
  }

  const selectFriend = (friend: Friend) => {
    setSelectedFriend(friend)
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white relative">
      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
        fixed md:relative z-50 md:z-auto h-full w-[280px] md:w-1/3 lg:w-1/4 
        transform transition-transform duration-300 ease-in-out border-r border-gray-100
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        <UsersList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={selectFriend}
          onFriendsChanged={fetchFriends}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Mobile Header Toggle */}
        <div className="md:hidden p-4 border-b border-gray-100 flex items-center bg-white">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="ml-2 font-bold text-purple-800">ChatApp</span>
        </div>

        {selectedFriend ? (
            <ChatWindow
              friend={selectedFriend}
              initialMessages={[]}
              currentUserId={initialSession.user?.id ?? ""}
              socketUrl={
                process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
              }
              onConversationActivity={handleConversationActivity}
            />
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                {friends.length === 0 
                  ? "No tienes amigos todavía. ¡Añade algunos!" 
                  : "Selecciona un amigo para empezar a chatear"}
            </div>
        )}
      </div>
    </div>
  )
}
