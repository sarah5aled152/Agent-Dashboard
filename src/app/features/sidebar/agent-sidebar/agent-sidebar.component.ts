import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

import { AuthService } from './../../../core/auth.service';
import { ChatService } from '../../../services/chat/chat.service';
import { AgentStatusService } from '../../../services/agent-status/agent-status.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-agent-sidebar',
  standalone: true,
  imports: [FormsModule, NgClass, RouterLink, RouterModule],
  templateUrl: './agent-sidebar.component.html',
  styleUrl: './agent-sidebar.component.css',
})
export class AgentSidebarComponent implements OnInit {
  agentStatus: 'available' | 'away' | 'busy' = 'away';
  previousStatus: typeof this.agentStatus = 'away';

  constructor(
    private authService: AuthService,
    private agentStatusService: AgentStatusService,
    private chatService: ChatService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.agentStatusService.status$.subscribe({
      next: (status) => {
        this.agentStatus = status;
        this.previousStatus = status;
      },
      error: (err) =>
        console.error('[Sidebar] Failed to subscribe to status', err),
    });

    this.agentStatusService.refreshStatusFromServer();
  }

  handleChangeAgentStatus(newStatus: 'available' | 'away' | 'busy') {
    if (newStatus === this.previousStatus) return;

    const confirmed = confirm(
      `Are you sure to change status to "${newStatus}"?`
    );

    if (!confirmed) {
      this.agentStatus = this.previousStatus;
      return;
    }

    this.agentStatusService.updateStatus(newStatus).subscribe({
      next: () => {
        this.agentStatus = newStatus;
        this.previousStatus = newStatus;

        if (newStatus === 'available') {
          this.checkForChats();
        } else if (newStatus === 'away') {
          this.chatService.resetChat(); // clear UI
        }
      },
      error: (err) => {
        console.error('[Sidebar] Failed to update status', err);
        alert(err?.error?.message || 'Error updating status');
        this.agentStatus = this.previousStatus;
      },
    });
  }

  private checkForChats(): void {
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<any[]>('http://localhost:3000/chats/agent', { headers })
      .subscribe({
        next: (chats) => {
          if (Array.isArray(chats) && chats.length > 0) {
            this.chatService.selectChat(chats[0].id);
          }
        },
        error: (err) => console.error('[Sidebar] Failed to fetch chats', err),
      });
  }

  logout() {
    this.agentStatusService.updateStatus('away').subscribe({
      next: () => {
        this.chatService.resetChat();
        this.authService.logout().subscribe({
          next: () => {
            console.log('Logout successful');
          },
          error: (err) => {
            console.error('[Sidebar] Logout failed:', err);
            alert('Failed to logout. Please try again.');
          }
        });
      },
      error: (err) => {
        console.error('[Sidebar] Failed to set status to away before logout:', err);
        // Still try to logout even if status update fails
        this.authService.logout().subscribe({
          next: () => {
            console.log('Logout successful despite status update failure');
          },
          error: (logoutErr) => {
            console.error('[Sidebar] Logout failed:', logoutErr);
            alert('Something went wrong during logout. Please try again.');
          }
        });
      }
    });
  }
}
