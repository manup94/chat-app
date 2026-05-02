"use client"

import UsersList from "../friends-list"
import { useState, useEffect, useCallback } from "react"
import { Friend } from "@/models/interfaces/friend"
import { Session } from "next-auth"
import { Message } from "@/models/interfaces/message"
import { useApi } from "@/hooks/use-api"
import { ChatWindow } from "../chat-window"

interface HomeWrapperProps {
  initialSession: Session
}

export const HomeWrapper = ({ initialSession }: HomeWrapperProps) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const {
    fetchWithAuth,
    authStatus,
    hasAccessToken,
    accessToken,
  } = useApi(initialSession.accessToken)

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends`
      )

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
  }, [fetchWithAuth])

  useEffect(() => {
    if (authStatus === "loading" || !hasAccessToken || !accessToken) {
      return
    }

    fetchFriends()
  }, [accessToken, authStatus, fetchFriends, hasAccessToken])

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

      const activeFriend = updatedFriends.find(
        (friend) => friend.id === friendId
      )
      const otherFriends = updatedFriends.filter(
        (friend) => friend.id !== friendId
      )

      return activeFriend ? [activeFriend, ...otherFriends] : updatedFriends
    })
  }

  const selectFriend = (friend: Friend) => {
    setSelectedFriend(friend)
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-stone-100">
      <div
        className={`h-full w-full border-r border-stone-200 bg-white md:flex md:w-[340px] md:max-w-[38vw] md:flex-col lg:w-[360px] ${
          selectedFriend ? "hidden md:flex" : "flex"
        }`}
      >
        <UsersList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={selectFriend}
          onFriendsChanged={fetchFriends}
        />
      </div>

      <div
        className={`min-w-0 flex-1 flex-col bg-white md:flex ${
          selectedFriend ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedFriend ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatWindow
              friend={selectedFriend}
              initialMessages={[]}
              currentUserId={initialSession.user?.id ?? ""}
              initialAccessToken={initialSession.accessToken}
              socketUrl={
                process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
              }
              onConversationActivity={handleConversationActivity}
              onBack={() => setSelectedFriend(null)}
            />
          </div>
        ) : (
          <div className="hidden h-full flex-1 items-center justify-center bg-stone-50 md:flex">
            <div className="max-w-sm rounded-[28px] border border-stone-200 bg-white px-8 py-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-stone-900">
                Selecciona una conversación
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Elige un chat desde la lista para abrir la conversación.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
