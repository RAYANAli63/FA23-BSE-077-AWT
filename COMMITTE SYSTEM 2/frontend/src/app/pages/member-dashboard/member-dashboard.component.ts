import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <app-sidebar role="member"></app-sidebar>
      <div class="flex-1 md:ml-64 flex flex-col">
        <app-topbar title="My Dashboard" role="member"></app-topbar>
        
        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
          <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center shadow-sm">
             <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {{error}}
          </div>

          <!-- Skeleton Loader -->
          <div *ngIf="isLoading" class="animate-pulse">
            <div class="h-32 bg-slate-200 rounded-2xl mb-8"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div *ngFor="let i of [1,2,3]" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-24"></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div class="h-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"></div>
               <div class="h-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"></div>
            </div>
          </div>

          <div *ngIf="!isLoading" class="animate-fade-in-up">
            <!-- Welcome Section -->
            <div class="bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl p-8 text-white shadow-lg shadow-indigo-500/20 mb-8 relative overflow-hidden">
               <div class="relative z-10">
                  <h1 class="text-3xl font-bold mb-2">Welcome back, {{member?.name || 'Member'}}! 👋</h1>
                  <p class="text-indigo-100 text-lg max-w-xl">Your dashboard is connected and live. Keep up the great savings habit!</p>
               </div>
               <div class="absolute right-0 bottom-0 opacity-20 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                  <svg class="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
               </div>
            </div>

            <!-- Quick Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <div>
                        <p class="text-sm font-medium text-slate-500">Total Committees</p>
                        <p class="text-2xl font-bold text-slate-800">{{committees.length}}</p>
                     </div>
                  </div>
               </div>
               <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <div>
                        <p class="text-sm font-medium text-slate-500">Upcoming Payouts</p>
                        <p class="text-2xl font-bold text-slate-800">{{stats?.pendingPayouts || 0}}</p>
                     </div>
                  </div>
               </div>
               <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                     </div>
                     <div>
                        <p class="text-sm font-medium text-slate-500">Pending Payments</p>
                        <p class="text-2xl font-bold text-slate-800">{{stats?.pendingPayments || 0}}</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Active Committees & Upcoming payments -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div class="flex justify-between items-center mb-6">
                     <h2 class="text-lg font-bold text-slate-800">My Committees</h2>
                     <button class="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                  </div>
                  
                  <div *ngIf="committees.length === 0" class="text-center py-8 text-slate-500">
                    No active committees found.
                  </div>

                  <div class="space-y-4">
                     <div *ngFor="let c of committees.slice(0, 3)" class="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-sm transition-all group">
                        <div class="flex justify-between items-start mb-2">
                           <div>
                              <h3 class="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{{c.name}}</h3>
                              <p class="text-sm text-slate-500">Started: {{c.startDate | date}}</p>
                           </div>
                           <span class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                                 [ngClass]="c.status === 'active' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-200'">
                             {{c.status | titlecase}}
                           </span>
                        </div>
                        <div class="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-50">
                           <span class="text-slate-600">Monthly: <strong class="text-slate-800">Rs {{c.monthlyAmount | number}}</strong></span>
                           <span class="text-slate-600">Members: <strong class="text-slate-800">{{c.totalMembers}}</strong></span>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 class="text-lg font-bold text-slate-800 mb-6">Upcoming Payments</h2>
                  
                  <div *ngIf="transactions.length === 0" class="text-center py-8 text-slate-500">
                    No upcoming payments found.
                  </div>

                  <div *ngFor="let tx of transactions" class="border border-slate-100 rounded-xl p-5 mb-4 flex justify-between items-center hover:border-orange-200 transition-colors">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center"
                             [ngClass]="tx.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'">
                           <svg *ngIf="tx.status === 'pending'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           <svg *ngIf="tx.status === 'paid'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                           <p class="font-bold text-slate-800">{{tx.committeeId?.name || 'Committee Payment'}}</p>
                           <p class="text-sm font-medium" [ngClass]="tx.status === 'pending' ? 'text-orange-600' : 'text-green-600'">
                             {{tx.status | titlecase}}
                           </p>
                        </div>
                     </div>
                     <div class="text-right">
                        <p class="font-bold text-slate-800">Rs {{tx.amount | number}}</p>
                     </div>
                  </div>

               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class MemberDashboardComponent implements OnInit {
  isLoading = true;
  stats: any = null;
  committees: any[] = [];
  transactions: any[] = [];
  error = '';
  member: any = null;

  constructor(private apiService: ApiService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.error = '';

    setTimeout(() => {
      // Fetch Dashboard Stats
      this.apiService.getDashboardStats().subscribe({
        next: (data) => this.stats = data,
        error: () => this.error = 'Could not load stats.'
      });

      // Fetch Committees
      this.http.get<any[]>('http://localhost:5000/api/committees').subscribe({
        next: (data) => {
          this.committees = data;
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to fetch dashboard data.';
          this.isLoading = false;
        }
      });

      // Fetch member transactions
      this.apiService.getRecentTransactions().subscribe({
        next: (data) => this.transactions = data.slice(0, 5),
        error: () => {}
      });

    }, 600);
  }
}
