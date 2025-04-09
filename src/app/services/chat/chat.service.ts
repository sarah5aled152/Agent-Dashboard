import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface Message {
  id?: string; // We'll generate a temp ID if none is provided
  _id?: string; // If server returns _id, we convert it to id
  chatId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  status?: string;
  createdAt?: Date | string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<Message[]>([]);

  constructor() {
    // Connect once on service init
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => console.log('Agent connected to socket'));
    this.socket.on('disconnect', () =>
      console.log('Agent socket disconnected')
    );

    // Join the notification room right away
    this.joinNotification();

    // Listen for all incoming events/messages
    this.listenForMessages();
  }

  // Called once in the constructor, so the agent is always in the notification room
  joinNotification() {
    const token: any = localStorage.getItem('token');
    const decoded: any = jwtDecode(token);
    console.log('Agent id:', decoded);
    this.socket.emit('joinNotification', decoded.id);
  }

  sendMessage(
    chatId: string,
    message: string,
    senderId: string,
    receiverId?: string
  ) {
    const payload = { chatId, message, senderId, receiverId };
    console.log('[Agent] Sending message payload:', payload);
    this.socket.emit('sendMessage', payload);
  }

  private listenForMessages() {
    console.log('[Agent] Listening for socket messages...');

    // Fired when a new message arrives in the chat
    this.socket.on('messageReceived', ({ message }: { message: any }) => {
      console.log('[Agent] Socket messageReceived:', message);

      // Convert `_id` to `id` if needed
      if (message._id && !message.id) {
        message.id = message._id;
        delete message._id;
      }

      // Merge into our local BehaviorSubject if not already there
      const current = this.messages$.getValue();
      const exists = current.some((m) => m.id === message.id);
      if (!exists) {
        this.messages$.next([...current, message]);
      }
    });

    this.socket.on('chatCreated', ({ chatId }: { chatId: any }) => {
      console.log('[Agent] chatCreated event for chatId:', chatId);
      // You can handle UI notifications, fetch chat details, etc.
    });
  }

  // Called after you fetch initial messages from your API
  setInitialMessages(messages: Message[]) {
    console.log('[Agent] setInitialMessages from BE:', messages);
    const current = this.messages$.getValue();
    const combined = [...messages];

    // If the socket had already received messages before your fetch, merge them here
    current.forEach((msg) => {
      if (msg.id && !combined.some((m) => m.id === msg.id)) {
        combined.push(msg);
      }
    });

    this.messages$.next(combined);
  }

  // Add a new message to local state (e.g. optimistic UI updates)
  pushLocalMessage(messageObj: Message) {
    const current = this.messages$.getValue();
    this.messages$.next([...current, messageObj]);
  }

  // Allows components to subscribe to message updates
  getMessagesStream() {
    return this.messages$.asObservable();
  }

  // Synchronous getter if you need the current state
  getCurrentMessages(): Message[] {
    return this.messages$.getValue();
  }
}
