import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface messageType {
  agentID: string;
  message: string;
  from: 'client' | 'agent';
  time: Date;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, NgClass],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
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
  message: string = '';
  messageValid: boolean = false;

  agentStatus: 'online' | 'offline' = 'online';

  currentChatStatus: 'open' | 'pending' | 'closed' = 'open';

  handleTyping = () => {
    if (this.message.trim().length >= 2) {
      this.messageValid = true;
    } else {
      this.messageValid = false;
    }
  };

  handleSend = () => {
    this.messages.push({
      message: this.message,
      from: 'agent',
      agentID: '1',
      time: new Date(),
    });

    // handle send message

    this.message = '';
  };

  handleChangeAgentStatus = (status: 'online' | 'offline') => {
    const confirmed = confirm('Are you sure you want to change your status?');
    if (confirmed) {
      this.agentStatus = status;
      console.log('Yes, change my status');
    }
    if (status === 'offline') {
      // handle offline status
    }
    if (status === 'online') {
      // handle online status
    }
  };

  handleChangeChatStatus = (chatStatus: 'open' | 'pending' | 'closed') => {
    const confirmed = confirm('Are you sure you want to change ticket status?');
    if (confirmed) {
      this.currentChatStatus = chatStatus;
      console.log('Yes, change chat status');
    }
    if (chatStatus === 'closed') {
      // handle closed chat
    }
    if (chatStatus === 'pending') {
      // handle pending chat
    }
  };
}
