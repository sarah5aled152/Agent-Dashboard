import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;

  private readonly chatIdSubject = new BehaviorSubject<string | null>(null);
  readonly chatId$ = this.chatIdSubject.asObservable();

  private readonly messagesSubject = new BehaviorSubject<any[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => console.log('[Agent] socket connected'));
    this.socket.on('disconnect', () =>
      console.log('[Agent] socket disconnected')
    );

    this.joinNotification();
    this.listenForEvents();
  }

  private joinNotification(): void {
    const token = localStorage.getItem('token') ?? '';
    const { id } = jwtDecode<any>(token);
    this.socket.emit('joinNotification', id);
  }

  sendMessage(content: string, senderId: string, receiverId?: string): void {
    const chatId = this.chatIdSubject.value;
    if (!chatId) return;

    this.socket.emit('sendMessage', {
      chatId,
      message: content,
      senderId,
      receiverId,
    });
  }

  private listenForEvents(): void {
    this.socket.on('chatCreated', ({ chatId }: { chatId: string }) => {
      console.log('[Agent] chatCreated →', chatId);
      this.socket.emit('joinChat', { chatId, userType: 'agent' });
      console.log('[Agent] joinChat emitted for', chatId);
      this.chatIdSubject.next(chatId);
    });

    this.socket.on('messageReceived', ({ message }: { message: any }) => {
      console.log('[Agent] messageReceived →', message);

      if (message._id && !message.id) {
        message.id = message._id;
        delete message._id;
      }

      const current = this.messagesSubject.value;
      if (!current.some((m) => m.id === message.id)) {
        this.messagesSubject.next([...current, message]);
      }
    });
  }

  setInitialMessages(serverMsgs: any[]): void {
    const merged = [
      ...serverMsgs,
      ...this.messagesSubject.value.filter(
        (m) => !serverMsgs.some((s) => s.id === m.id)
      ),
    ];
    this.messagesSubject.next(merged);
  }

  /** Called when agent loads and already has active chats */
  selectChat(chatId: string): void {
    if (!chatId) return;
    this.socket.emit('joinChat', { chatId, userType: 'agent' });
    console.log('[Agent] joinChat emitted (manual) →', chatId);
    this.chatIdSubject.next(chatId);
  }
}
