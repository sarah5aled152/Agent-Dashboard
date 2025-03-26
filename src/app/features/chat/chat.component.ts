import { NgClass, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface messageType {
  agentID: string;
  message: string;
  from: 'client' | 'agent';
  time: Date;
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
export class ChatComponent {
  // Dropdown states
  showAgentStatusDropdown = false;
  showChatStatusDropdown = false;

  // Messages
  messages: messageType[] = [
    {
      agentID: '1',
      message: 'Hello, I need help with my order.',
      from: 'client',
      time: new Date(),
    },
    {
      agentID: '1',
      message: 'Hello, How can I help you?',
      from: 'agent',
      time: new Date(),
    },
  ];
  
  // Form controls
  message = '';
  messageValid = false;

  // Statuses
  agentStatus: 'online' | 'offline' = 'online';
  currentChatStatus: 'open' | 'pending' | 'closed' = 'open';

  // Status options
  chatStatusOptions: ChatStatusOption[] = [
    { value: 'open', label: 'Open', colorClass: 'bg-green-500' },
    { value: 'pending', label: 'Pending', colorClass: 'bg-yellow-500' },
    { value: 'closed', label: 'Closed', colorClass: 'bg-red-500' }
  ];

  // Typing handler
  handleTyping() {
    this.messageValid = this.message.trim().length >= 2;
  }

  // Send message
  handleSend() {
    if (!this.messageValid) return;
    
    this.messages.push({
      message: this.message,
      from: 'agent',
      agentID: '1',
      time: new Date(),
    });

    this.message = '';
    this.messageValid = false;
  }

  // Change agent status
  handleChangeAgentStatus(status: 'online' | 'offline') {
    const confirmed = confirm('Change your status to ' + status + '?');
    if (confirmed) {
      this.agentStatus = status;
      this.showAgentStatusDropdown = false;
    }
  }

  // Change chat status
  handleChangeChatStatus(status: 'open' | 'pending' | 'closed') {
    const confirmed = confirm('Change chat status to ' + status + '?');
    if (confirmed) {
      this.currentChatStatus = status;
      this.showChatStatusDropdown = false;
    }
  }

  // Get color for current status
  getCurrentStatusColor(): string {
    const status = this.chatStatusOptions.find(opt => opt.value === this.currentChatStatus);
    return status ? status.colorClass : 'bg-gray-500';
  }
}