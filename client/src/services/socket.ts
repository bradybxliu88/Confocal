import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Listen for various events
    this.socket.on('notification', (data: any) => {
      this.emit('notification', data);
    });

    this.socket.on('order_update', (data: any) => {
      this.emit('order_update', data);
    });

    this.socket.on('booking_created', (data: any) => {
      this.emit('booking_created', data);
    });

    this.socket.on('booking_updated', (data: any) => {
      this.emit('booking_updated', data);
    });

    this.socket.on('project_update', (data: any) => {
      this.emit('project_update', data);
    });

    this.socket.on('low_stock_alert', (data: any) => {
      this.emit('low_stock_alert', data);
    });
  }

  joinProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-project', projectId);
    }
  }

  leaveProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-project', projectId);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  sendMessage(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
