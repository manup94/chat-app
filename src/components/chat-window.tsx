"use client"

import { Friend } from "@/models/interfaces/friend"
import { useState, useRef, useEffect } from "react"
import { FriendAndUserStatus } from "@/models/interfaces/friend-and-user-status"
import { Message } from "@/models/interfaces/message"
import { Send, ArrowLeft } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { useSession } from "next-auth/react"
import { useApi } from "@/hooks/use-api"

interface ChatWindowProps {
  friend: Friend
  initialMessages: Message[]
  currentUserId: string
  initialAccessToken?: string
  socketUrl: string
  onConversationActivity: (message: Message) => void
  onBack?: () => void
}

export const ChatWindow = ({
  friend,
  initialMessages,
  currentUserId,
  initialAccessToken,
  socketUrl,
  onConversationActivity,
  onBack,
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()
  const { fetchWithAuth, authStatus, hasAccessToken, accessToken } = useApi(
    initialAccessToken
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const { socket, isConnected, error } = useSocket(
    socketUrl,
    accessToken ?? (status === "authenticated" ? session?.accessToken : undefined)
  )

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${friend.id}`
        )
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Error al cargar mensajes:", error)
      } finally {
        setLoading(false)
      }
    }

    if (
      authStatus !== "loading" &&
      hasAccessToken &&
      accessToken &&
      (session || initialAccessToken)
    ) {
      fetchMessages()
    }
  }, [
    accessToken,
    authStatus,
    fetchWithAuth,
    friend.id,
    hasAccessToken,
    initialAccessToken,
    session,
  ])

  useEffect(() => {
    if (!socket) return

    socket.on("receiveMessage", (message: Message) => {
      if (message.senderId !== friend.id && message.receiverId !== friend.id) {
        return
      }

      onConversationActivity?.(message)
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    })

    socket.on("messageSent", (message: Message) => {
      onConversationActivity?.(message)
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    })

    return () => {
      socket.off("receiveMessage")
      socket.off("messageSent")
    }
  }, [friend.id, onConversationActivity, socket])

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage?.trim() && socket) {
      const msgData = {
        content: newMessage,
        receiverId: friend.id,
      }
      socket.emit("sendMessage", msgData)
      setNewMessage("")
    }
  }

  const formatTime = (timestamp: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp))
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-stone-50">
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-5">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-2 flex h-11 w-11 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 md:hidden"
              aria-label="Volver a la lista de chats"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-base font-bold text-sky-700">
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
          <div className="ml-3 min-w-0">
            <p className="truncate text-[15px] font-semibold text-stone-900">
              {friend.name}
            </p>
            <p className="text-xs text-stone-400">
              {error
                ? "Error de conexión"
                : isConnected
                ? "En línea"
                : "Desconectado"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 pb-28 md:px-6 md:py-6">
        {loading ? (
          <div className="flex min-h-full items-center justify-center py-4 text-stone-400">
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-full items-center justify-center px-6 text-center">
            <div className="rounded-[28px] border border-dashed border-stone-200 bg-white px-8 py-10 shadow-sm">
              <p className="text-base font-medium text-stone-900">
                No hay mensajes aún
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Envía el primer mensaje para abrir la conversación.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[84%] rounded-[22px] px-4 py-3 shadow-sm md:max-w-[78%] ${
                      isCurrentUser
                        ? "rounded-br-md bg-violet-700 text-white"
                        : "rounded-bl-md border border-stone-200 bg-white text-stone-800"
                    }`}
                  >
                    <p className="text-[15px] leading-6 md:text-base">
                      {message.content}
                    </p>
                    <p
                      className={`mt-1.5 text-[11px] font-medium ${
                        isCurrentUser ? "text-violet-200" : "text-stone-400"
                      }`}
                      suppressHydrationWarning
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div ref={scrollRef} className="h-0" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 z-20 border-t border-stone-200 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:px-5"
      >
        <div className="flex items-end gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="min-h-11 flex-1 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[16px] text-stone-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/15"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-sm transition-all duration-200 hover:bg-violet-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
