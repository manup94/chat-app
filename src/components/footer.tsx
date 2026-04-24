"use client"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-3 text-center text-sm">
      <p>© {new Date().getFullYear()} Chat Application. Todos los derechos reservados.</p>
    </footer>
  )
}