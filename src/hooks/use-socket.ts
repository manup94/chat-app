import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("No se encontró token en localStorage, esperando login...");
      return;
    }

    console.log("Intentando conectar socket con token:", token ? "EXISTE" : "VACÍO");
    const socketInstance = io(url, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket'],
      auth: {
        token: token,
      },
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
    });

    socketInstance.on('error', (err) => {
      console.error("Error recibido del socket:", err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, isConnected, error };
};
