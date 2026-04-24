"use client"

import { Friend } from "@/models/interfaces/friend"
import { FriendAndUserStatus } from "@/models/interfaces/friend-and-user-status"
import { useSession, signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { AddFriend } from "./add-friend"
import { FriendRequests } from "./friend-requests"

interface UsersListProps {
  friends: Friend[]
  selectedFriend: Friend | null
  onSelectFriend: (friend: Friend) => void
  onFriendsChanged: () => Promise<void> | void
}

export default function UsersList({
  friends,
  selectedFriend,
  onSelectFriend,
  onFriendsChanged,
}: UsersListProps) {
  const { data: session } = useSession()
  const formatLastActivity = (timestamp?: string) => {
    if (!timestamp) return ""

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ""

    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Amigos</h2>
      </div>
      <AddFriend onAdd={onFriendsChanged} />
      <FriendRequests onAction={onFriendsChanged} />
      <div className="flex-1 overflow-y-auto">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedFriend?.id === friend.id ? "bg-blue-50" : ""
            }`}
            onClick={() => onSelectFriend(friend)}
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {friend.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    friend.status === FriendAndUserStatus.ONLINE
                      ? "bg-green-500"
                      : friend.status === FriendAndUserStatus.AWAY
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-700 truncate">{friend.name}</p>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatLastActivity(friend.lastActivityAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {friend.lastMessage ?? "Sin mensajes todavía"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Section at the bottom */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
              {session?.user?.name || "Usuario"}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              En línea
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
