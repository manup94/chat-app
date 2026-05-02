"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useApi } from "@/hooks/use-api"

interface FriendRequest {
  id: string
  senderName: string
}

export const FriendRequests = ({
  onAction,
}: {
  onAction: () => Promise<void> | void
}) => {
  const { data: session, status } = useSession()
  const { fetchWithAuth, authStatus, hasAccessToken } = useApi()
  const [requests, setRequests] = useState<FriendRequest[]>([])

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/friend-requests`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        setRequests([])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    if (session && status === "authenticated" && authStatus === "authenticated" && hasAccessToken) {
      fetchRequests()
    }
  }, [authStatus, fetchRequests, hasAccessToken, session, status])

  const handleAction = async (id: string, status: string) => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/friend-request/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
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
    <div className="mt-3 border-t border-stone-100 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">Solicitudes</h3>
        <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold text-stone-500">
          {requests.length}
        </span>
      </div>

      {requests.length === 0 ? (
        <p className="text-xs leading-5 text-stone-500">
          No tienes solicitudes pendientes.
        </p>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3"
          >
            <p className="truncate text-sm font-medium text-stone-700">
              {req.senderName}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAction(req.id, "ACCEPTED")}
                className="min-h-11 flex-1 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Aceptar
              </button>
              <button
                onClick={() => handleAction(req.id, "REJECTED")}
                className="min-h-11 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition hover:bg-stone-100"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
