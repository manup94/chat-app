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
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-stone-200 bg-white px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-4 md:pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
          Inbox
        </p>
        <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight text-stone-900 md:text-2xl">
          Chats
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {friends.length === 0
            ? "Añade contactos para empezar a conversar."
            : `${friends.length} conversación${friends.length === 1 ? "" : "es"} disponible${friends.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
        <div className="rounded-[24px] border border-stone-200 bg-white p-3 shadow-sm">
          <AddFriend onAdd={onFriendsChanged} />
          <FriendRequests onAction={onFriendsChanged} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-3 pb-3 pt-2">
        {friends.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-stone-200 bg-stone-50 px-6 py-10 text-center">
            <p className="text-base font-medium text-stone-900">
              Tu lista de chats está vacía
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">
              Usa el bloque superior para enviar una solicitud o aceptar una
              invitación pendiente.
            </p>
          </div>
        ) : (
          friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              className={`mb-2 flex min-h-14 w-full items-center rounded-[22px] border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                selectedFriend?.id === friend.id
                  ? "border-violet-200 bg-violet-50"
                  : "border-transparent bg-white hover:border-stone-200 hover:bg-stone-50"
              }`}
              onClick={() => onSelectFriend(friend)}
            >
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-base font-bold text-sky-700">
                  {friend.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    friend.status === FriendAndUserStatus.ONLINE
                      ? "bg-emerald-500"
                      : friend.status === FriendAndUserStatus.AWAY
                        ? "bg-amber-400"
                        : "bg-stone-400"
                  }`}
                />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-[15px] font-semibold text-stone-800">
                    {friend.name}
                  </p>
                  <span className="shrink-0 pt-0.5 text-[11px] font-medium text-stone-400">
                    {formatLastActivity(friend.lastActivityAt)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-stone-500">
                  {friend.lastMessage ?? "Sin mensajes todavía"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex min-w-0 items-center gap-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-stone-800">
              {session?.user?.name || "Usuario"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              En línea
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex h-11 w-11 items-center justify-center rounded-full text-stone-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
