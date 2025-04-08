import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgClass, TitleCasePipe } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { AgentSidebarComponent } from '../sidebar/agent-sidebar/agent-sidebar.component';

// export interface messageType {
//   id?: string;
//   chatId: string;
//   receiverId?: string;
//   senderId: string;
//   content: string;
//   from?: 'client' | 'agent';
//   createdAt?: Date;
// }

interface ChatStatusOption {
  value: 'open' | 'pending' | 'closed';
  label: string;
  colorClass: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgClass, TitleCasePipe, AgentSidebarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Dropdown toggles
  showAgentStatusDropdown = false;
  showChatStatusDropdown = false;

  // Messages array
  messages: any[] = [];

  // For input
  message = '';
  messageValid = false;

  // Agent & Chat statuses
  agentStatus: 'online' | 'away' = 'online';
  currentChatStatus: 'open' | 'pending' | 'closed' = 'open';

  // IDs
  chatId = '67f5604a075802b2493d6e91';
  userId = localStorage.getItem('userId') || 'agent';

  // Chat status dropdown options
  chatStatusOptions: ChatStatusOption[] = [
    { value: 'open', label: 'Open', colorClass: 'bg-green-500' },
    { value: 'pending', label: 'Pending', colorClass: 'bg-yellow-500' },
    { value: 'closed', label: 'Closed', colorClass: 'bg-red-500' },
  ];
  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    // this.chatService.notification();
    this.chatService.joinChat(this.chatId);

    this.chatService.getMessagesStream().subscribe((msgs) => {
      this.messages = msgs as any[];
      setTimeout(() => this.scrollToBottom(), 100);
    });

    this.getMessages();
  }

  ngAfterViewInit() {
    // Scroll to bottom on component init
    setTimeout(() => this.scrollToBottom(), 300);
  }

  getMessages() {
    const url = `http://localhost:3000/messages/agent/${this.chatId}`;
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(url, { headers }).subscribe((response) => {
      console.log('[Agent] Fetched messages from BE:', response);
      this.chatService.setInitialMessages(response);
    });
  }

  changeAgentStatus() {
    const url = `http://localhost:3000/profile/agent/${this.agentStatus}`;
    const token = localStorage.getItem('token') || '';
    console.log(token);
    const headers = { Authorization: `Bearer ${token}` };
    this.http.put<any>(url, { headers }).subscribe((response) => {
      console.log('agent status changed', response);
    });
  }

  handleTyping() {
    this.messageValid = this.message.trim().length >= 2;
  }

  handleSend() {
    if (!this.messageValid) return;

    const newMessageContent = this.message.trim();

    const localMessage: any = {
      id: 'temp-' + Date.now(),
      chatId: this.chatId,
      senderId: this.userId,
      content: newMessageContent,
      createdAt: new Date(),
    };

    this.chatService.pushLocalMessage(localMessage);

    this.chatService.sendMessage(this.chatId, newMessageContent, this.userId);

    this.message = '';
    this.messageValid = false;
  }

  scrollToBottom(): void {
    if (!this.scrollContainer) return;
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  // Agent status
  handleChangeAgentStatus(status: 'online' | 'away') {
    if (confirm('Change your status to ' + status + '?')) {
      this.agentStatus = status;
      this.showAgentStatusDropdown = false;
      this.changeAgentStatus();
    }
  }

  // Chat status
  handleChangeChatStatus(status: 'open' | 'pending' | 'closed') {
    if (confirm('Change chat status to ' + status + '?')) {
      this.currentChatStatus = status;
      this.showChatStatusDropdown = false;
    }
  }

  getCurrentStatusColor(): string {
    const status = this.chatStatusOptions.find(
      (opt) => opt.value === this.currentChatStatus
    );
    return status ? status.colorClass : 'bg-gray-500';
  }
  navigateToUserProfile(userAccessToken: string) {
    this.router.navigate(['/user-info', userAccessToken]);
  }
}
