import { AnimatePresence, motion } from "framer-motion"
import { SendHorizonal, UserPlus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const AddFriend = ({ onAdd }: { onAdd: () => Promise<void> | void }) => {
  const [email, setEmail] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleAdd = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friend-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ email }),
        }
      )

      if (response.status === 409) {
        const data = await response.json().catch(() => null)
        toast.error(
          data?.error ?? "Ya existe una solicitud de amistad entre ustedes."
        )
      } else if (response.status === 400) {
        const data = await response.json().catch(() => null)
        toast.error(data?.error ?? "Petición inválida.")
      } else if (response.ok) {
        setEmail("")
        setIsOpen(false)
        toast.success("Solicitud enviada correctamente.")
        await onAdd()
      } else {
        console.error("Error adding friend:", await response.text())
        toast.error(
          "No se pudo enviar la solicitud. Verifica el correo e intenta de nuevo."
        )
      }
    } catch (error) {
      console.error("Error adding friend:", error)
      toast.error("Error de conexión al intentar enviar la solicitud.")
    }
  }

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-2 ">
      <div className="relative flex items-center">
        <motion.button
          type="button"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          whileTap={{ scale: 0.94 }}
          animate={{
            rotate: isOpen ? 45 : 0,
            backgroundColor: isOpen ? "#2563eb" : "#111827",
          }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
          aria-label={
            isOpen ? "Cerrar formulario de amigo" : "Abrir formulario de amigo"
          }
        >
          <UserPlus size={18} />
        </motion.button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="friend-form"
              initial={{ opacity: 0, x: -12, scaleX: 0.96 }}
              animate={{ opacity: 1, x: 0, scaleX: 1 }}
              exit={{ opacity: 0, x: -12, scaleX: 0.96 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              style={{ originX: 0 }}
              className="absolute inset-y-0 left-14 right-0 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="flex-1 rounded-xl border-1 border-primary-500 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary-500"
                  autoFocus
                />
                <motion.button
                  type="button"
                  onClick={handleAdd}
                  whileTap={{ scale: 0.96 }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
                  aria-label="Enviar solicitud de amistad"
                >
                  <SendHorizonal size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
