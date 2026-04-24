import { FriendAndUserStatus } from "./friend-and-user-status"

export interface Friend {
  id: string
  name: string
  email?: string
  status: FriendAndUserStatus
  lastMessage?: string
  lastActivityAt?: string
}
