import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface FriendRequest {
  id: string
  senderName: string
}

export const FriendRequests = ({
  onAction,
}: {
  onAction: () => Promise<void> | void
}) => {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<FriendRequest[]>([])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friend-requests`, {
        headers: {
          "Authorization": `Bearer ${(session as any)?.accessToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        setRequests([])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchRequests()
    }
  }, [session])

  const handleAction = async (id: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friend-request/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        await fetchRequests()
        await onAction()
      }
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Solicitudes</h3>
      {requests.map((req) => (
        <div key={req.id} className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600">{req.senderName}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(req.id, "ACCEPTED")}
              className="text-green-600 text-xs font-bold"
            >
              Aceptar
            </button>
            <button
              onClick={() => handleAction(req.id, "REJECTED")}
              className="text-red-600 text-xs font-bold"
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
