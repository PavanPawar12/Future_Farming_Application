import { io } from 'socket.io-client';

let socket = null;

export function getSocket(token) {
  if (socket?.connected) return socket;
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  socket = io(url, { auth: { token }, withCredentials: true });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
