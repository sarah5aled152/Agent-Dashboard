import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgClass, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import { ChatService } from '../../services/chat/chat.service';
import { AgentStatusService } from '../../services/agent-status/agent-status.service';
import { AgentSidebarComponent } from '../sidebar/agent-sidebar/agent-sidebar.component';
import { EmptyComponent } from '../empty/empty.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    TitleCasePipe,
    AgentSidebarComponent,
    EmptyComponent,
    DatePipe,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  showChatStatusDropdown = false;
  busy = false;

  messages: any[] = [];
  chatId: string | null = null;
  message = '';
  messageValid = false;

  currentChatStatus: any;

  userId = localStorage.getItem('userId') ?? 'agent';
  customerId: string | null = null;

  userInfo: any = null;
  lastOrders: any[] = [];

  chatStatusOptions: any = [
    { value: 'pending', label: 'Pending', colorClass: 'bg-yellow-500' },
    { value: 'resolved', label: 'Resolved', colorClass: 'bg-red-500' },
  ];
  

  private subs: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private agentStatusService: AgentStatusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchExistingChats();
    console.log("Customer ID at init:", this.customerId);
    this.subs.push(
      this.chatService.customerId$.subscribe((id) => {
        this.customerId = id;
      })
    );
    this.subs.push(
      this.chatService.chatId$.subscribe((id) => {
        this.chatId = id;
        this.busy = !!id;
        if (id) this.fetchHistory(id);
      })
    );

    this.subs.push(
      this.chatService.messages$.subscribe((msgs) => {
        console.log('[Agent] messages$ stream →', msgs);
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 50);
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 300);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private fetchExistingChats(): void {
    const url = 'http://localhost:3000/chats/agent';
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
    this.http.get<any[]>(url, { headers }).subscribe({
      next: (chats) => {
        console.log('[Agent] existing chats →', chats);
        console.log('Customer ID:', chats[0].customer);
        localStorage.setItem('customerId', chats[0].customer);
        
        if (Array.isArray(chats) && chats.length > 0) {
          const firstChat = chats[0];
          this.customerId = firstChat.customer;
          const firstChatId = firstChat.id;
          this.chatService.selectChat(firstChatId);

          this.fetchUserInfo(firstChat.customer);
          this.fetchUserOrders(firstChat.customer);
        }
      },
      error: (err) => {
        console.error('[Agent] /chats/agent error', err);
      },
    });
  }

  private fetchUserInfo(customerId: string): void {
    const url = `https://e-commerce-api-tau-five.vercel.app/profile/${customerId}`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        console.log('[Agent] User info:', response);
        this.userInfo = response.user;
      },
      error: (err) => {
        console.error('[Agent] Failed to fetch user info:', err);
        this.userInfo = null;
      },
    });
  }

  private fetchUserOrders(customerId: string): void {
    const url = `https://e-commerce-api-tau-five.vercel.app/order/my-orders/${customerId}`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        console.log('[Agent] User orders:', response);
        this.lastOrders = response.data
          .slice(0, 3)
          .map((order: any) => ({
            id: order._id,
            status: order.orderStatus,
          }));
      },
      error: (err) => {
        console.error('[Agent] Failed to fetch orders:', err);
        this.lastOrders = [];
      },
    });
  }

  private fetchHistory(chatId: string): void {
    const url = `http://localhost:3000/messages/agent/${chatId}`;
    const token = localStorage.getItem('token') ?? '';
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(url, { headers }).subscribe((msgs) => {
      console.log('[Agent] history:', msgs);
      this.chatService.setInitialMessages(msgs);
    });
  }

  handleTyping(): void {
    this.messageValid = this.message.trim().length >= 2;
  }

  handleSend(): void {
    if (!this.messageValid || !this.chatId) return;

    const content = this.message.trim();
    const senderEmail =
      localStorage.getItem('userEmail') ?? 'agent@example.com';

    const localMessage = {
      id: 'temp-' + Date.now(),
      chatId: this.chatId,
      senderId: {
        _id: this.userId,
        email: senderEmail,
      },
      senderRole: 'agent',
      content,
      createdAt: new Date(),
    };

    this.messages.push(localMessage);
    this.chatService.sendMessage(content, this.userId);
    this.message = '';
    this.messageValid = false;

    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    if (!this.scrollContainer) return;
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {
      console.error('[Agent] scroll error:', err);
    }
  }

  private updateChatStatus(status: string): void {
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `http://localhost:3000/chats/agent/${this.chatId}/${status}`;

    this.http.put(url, {}, { headers }).subscribe({
      next: () => {
        console.log('[Agent] Chat status updated to:', status);
        this.checkForNextActiveChat();

        // Refresh agent status after chat is resolved to reflect change in UI
        this.agentStatusService.getStatus().subscribe();
      },
      error: (err) => {
        console.error('[Agent] Failed to update status:', err);
      },
    });
  }

  private checkForNextActiveChat(): void {
    const url = 'http://localhost:3000/chats/agent';
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (chats) => {
        if (Array.isArray(chats) && chats.length > 0) {
          const nextChat = chats[0];
          this.chatService.selectChat(nextChat.id);
          this.fetchHistory(nextChat.id);
          this.busy = true;
        } else {
          this.busy = false;
          this.chatId = null;
          this.messages = [];
        }
      },
      error: (err) => {
        console.error('[Agent] Failed to fetch next chat:', err);
      },
    });
  }

  handleChangeChatStatus(status: any): void {
    if (!this.chatId) return;

    if (confirm(`Change chat status to "${status}"?`)) {
      this.currentChatStatus = status;
      this.showChatStatusDropdown = false;
      this.updateChatStatus(status);
    }
  }

  getCurrentStatusColor(): string {
    const status = this.chatStatusOptions.find(
      (opt: any) => opt.value === this.currentChatStatus
    );
    return status ? status.colorClass : 'bg-gray-500';
  }

  navigateToUserProfile(userAccessToken: string): void {
    this.router.navigate(['/user-info', userAccessToken]);
  }
}
