import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgClass, TitleCasePipe } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';

export interface messageType {
  id?: string;
  chatId: string;
  receiverId?: string;
  senderId: string;
  content: string;
  from?: 'client' | 'agent';
  createdAt?: Date;
}

interface ChatStatusOption {
  value: 'open' | 'pending' | 'closed';
  label: string;
  colorClass: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgClass, TitleCasePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Dropdown toggles
  showAgentStatusDropdown = false;
  showChatStatusDropdown = false;

  // Messages array
  messages: messageType[] = [];

  // For input
  message = '';
  messageValid = false;

  // Agent & Chat statuses
  agentStatus: 'online' | 'offline' = 'online';
  currentChatStatus: 'open' | 'pending' | 'closed' = 'open';

  // IDs
  chatId = '67e388a3698cf44ae3924e43';
  userId = localStorage.getItem('userId') || 'agent';

  // Chat status dropdown options
  chatStatusOptions: ChatStatusOption[] = [
    { value: 'open', label: 'Open', colorClass: 'bg-green-500' },
    { value: 'pending', label: 'Pending', colorClass: 'bg-yellow-500' },
    { value: 'closed', label: 'Closed', colorClass: 'bg-red-500' },
  ];

  constructor(private http: HttpClient, private chatService: ChatService) {}

  ngOnInit() {
    // 1) Join the chat room FIRST
    this.chatService.joinChat(this.chatId);

    // 2) Subscribe to live socket messages
    this.chatService.getMessagesStream().subscribe((msgs) => {
      this.messages = msgs as messageType[];
      // Auto-scroll on new messages
      setTimeout(() => this.scrollToBottom(), 100);
    });

    // 3) Fetch the existing conversation from your API
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

    this.http.get<messageType[]>(url, { headers }).subscribe((response) => {
      console.log('[Agent] Fetched messages from BE:', response);
      // Merge them with any new socket messages that arrived
      this.chatService.setInitialMessages(response);
    });
  }

  handleTyping() {
    this.messageValid = this.message.trim().length >= 2;
  }

  handleSend() {
    if (!this.messageValid) return;

    const newMessageContent = this.message.trim();

    const localMessage: messageType = {
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
  handleChangeAgentStatus(status: 'online' | 'offline') {
    if (confirm('Change your status to ' + status + '?')) {
      this.agentStatus = status;
      this.showAgentStatusDropdown = false;
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
}
