"use client"

interface NavbarProps {
  userName: string
  onLogout: () => void
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Chat App</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-medium">{userName}</span>
          <button 
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}