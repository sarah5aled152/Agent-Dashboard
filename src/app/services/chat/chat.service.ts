import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AgentStatusService } from '../agent-status/agent-status.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private customerIdSubject = new BehaviorSubject<string | null>(null);
  readonly customerId$ = this.customerIdSubject.asObservable();
  private readonly chatIdSubject = new BehaviorSubject<string | null>(null);
  readonly chatId$ = this.chatIdSubject.asObservable();

  private readonly messagesSubject = new BehaviorSubject<any[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  constructor(private agentStatusService: AgentStatusService) {
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

  private listenForEvents(): void {
    this.socket.on('chatCreated', (chat: any) => {
      console.log('[Agent] chatCreated →', chat);
      this.socket.emit('joinChat', { chatId: chat._id, userType: 'agent' });
      this.customerIdSubject.next(chat.customerId);
      this.chatIdSubject.next(chat._id);
      this.agentStatusService.refreshStatusFromServer(); // 👈 refresh status
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

      this.agentStatusService.refreshStatusFromServer(); // 👈 refresh status
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

  selectChat(chatId: string): void {
    if (!chatId) return;
    this.socket.emit('joinChat', { chatId, userType: 'agent' });
    this.chatIdSubject.next(chatId);
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

  resetChat(): void {
    this.chatIdSubject.next(null);
    this.messagesSubject.next([]);
  }
}
