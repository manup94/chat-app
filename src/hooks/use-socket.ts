import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { signOut } from 'next-auth/react';

export const useSocket = (url: string, token?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;

    const socketInstance = io(url, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket'],
      auth: {
        token: token
      }
    });

    socketInstance.onAny((event, ...args) => {
      console.log(`[Socket Debug] Evento: ${event}`, args);
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      setError(err);
      setIsConnected(false);
      
      if (err.message.includes("Authentication error")) {
        console.warn("Error de autenticación en Socket. Cerrando sesión...");
        signOut({ callbackUrl: "/login" });
      }
    });

    socketInstance.on('error', (err) => {
      console.error("Error recibido del socket:", err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url, token]);

  return { socket, isConnected, error };
};
