import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

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
    // Connect socket once
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => console.log('Agent connected to socket'));
    this.socket.on('disconnect', () =>
      console.log('Agent socket disconnected')
    );

    // Listen for new messages once in the constructor
    this.listenForMessages();
  }

  joinChat(chatId: string) {
    console.log('[Agent] Joining room:', chatId);
    this.socket.emit('joinChat', { chatId, userType: 'agent' });
    this.socket.on('notification', (payload: any) => {
      console.log('notification:', payload);
    });
  }

  notification() {
    console.log('[Agent] Listening for notifications...');
    this.socket.on('notification', (payload: any) => {
      console.log('notification:', payload);
    });
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

    // Main event for receiving new messages
    this.socket.on('messageReceived', ({ message }: { message: any }) => {
      console.log('[Agent] Socket messageReceived:', message);

      // If the server returns `_id` but no `id`, rename it to `id`
      if (message._id && !message.id) {
        message.id = message._id;
        delete message._id;
      }

      // Merge it into our local BehaviorSubject
      const current = this.messages$.getValue();
      const exists = current.some((m) => m.id === message.id);
      if (!exists) {
        this.messages$.next([...current, message]);
      }
    });
  }

  setInitialMessages(messages: Message[]) {
    console.log('[Agent] setInitialMessages from BE:', messages);
    const current = this.messages$.getValue();
    const combined = [...messages];

    // Append any socket messages that arrived before the fetch
    current.forEach((msg) => {
      if (msg.id && !combined.some((m) => m.id === msg.id)) {
        combined.push(msg);
      }
    });

    this.messages$.next(combined);
  }

  pushLocalMessage(messageObj: Message) {
    const current = this.messages$.getValue();
    this.messages$.next([...current, messageObj]);
  }

  getMessagesStream() {
    return this.messages$.asObservable();
  }

  getCurrentMessages(): Message[] {
    return this.messages$.getValue();
  }
}
