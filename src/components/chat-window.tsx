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
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {friend.name?.[0]?.toUpperCase() || "?"}
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
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{friend.name}</p>
            <p className="text-xs text-gray-400">
              {error
                ? "Error de conexión"
                : isConnected
                ? "En línea"
                : "Desconectado"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50/50 flex flex-col scroll-smooth">
        <div className="flex-1" /> {/* Spacer to push messages down if few */}
        {loading ? (
          <div className="flex justify-center items-center py-4 text-gray-400">
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center py-10 text-gray-400 text-center">
            No hay mensajes aún.<br />¡Di hola!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId
            return (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3 px-4 rounded-2xl shadow-sm ${
                    isCurrentUser
                      ? "bg-purple-800 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1.5 font-medium ${
                      isCurrentUser ? "text-purple-200" : "text-gray-400"
                    }`}
                    suppressHydrationWarning
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        {/* Anchor for auto-scroll */}
        <div ref={scrollRef} className="h-0" />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 pb-[env(safe-area-inset-bottom,1rem)] bg-white border-t border-gray-100 flex items-center gap-x-3 shrink-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-800/20 transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-purple-800 hover:bg-purple-900 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
