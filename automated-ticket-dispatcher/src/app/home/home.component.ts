import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="main">
      <div class="content">
        <div class="left-side">
          <h1>Automated Ticket Dispatcher</h1>
          <p>Welcome to the ticket management system! 🎫</p>
        </div>
        <div class="divider" role="separator" aria-label="Divider"></div>
        <div class="right-side">
          <div class="pill-group">
            <a class="pill" routerLink="/dashboard">Dashboard</a>
            <a class="pill" routerLink="/login">Login</a>
            <a class="pill" routerLink="/register">Register</a>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host {
      --primary-color: #3b82f6;
      --secondary-color: #f1f5f9;
      --text-color: #1e293b;
      --border-color: #e2e8f0;
    }

    .main {
      width: 100%;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    }

    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1000px;
      background: white;
      border-radius: 12px;
      padding: 3rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .left-side h1 {
      font-size: 2.5rem;
      color: var(--text-color);
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .left-side p {
      font-size: 1.1rem;
      color: #64748b;
      margin: 0;
    }

    .divider {
      width: 2px;
      height: 100px;
      background: linear-gradient(180deg, var(--primary-color), #8b5cf6);
      margin: 0 2rem;
    }

    .pill-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .pill:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    @media (max-width: 768px) {
      .content {
        flex-direction: column;
        text-align: center;
      }
      
      .divider {
        width: 100px;
        height: 2px;
        margin: 2rem 0;
      }
      
      .left-side h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent {

}
