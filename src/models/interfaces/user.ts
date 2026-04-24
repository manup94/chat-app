import { FriendAndUserStatus } from "./friend-and-user-status"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: FriendAndUserStatus
  lastActivityAt: number
}
