import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <app-sidebar role="admin"></app-sidebar>
      <div class="flex-1 md:ml-64 flex flex-col">
        <app-topbar title="Admin Dashboard" role="admin"></app-topbar>
        
        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
          
          <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center shadow-sm">
             <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {{error}}
          </div>

          <!-- Skeleton Loader for Stats -->
          <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
            <div *ngFor="let i of [1,2,3,4]" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
               <div class="flex items-center justify-between">
                  <div>
                    <div class="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                    <div class="h-8 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div class="w-12 h-12 rounded-xl bg-slate-100"></div>
               </div>
               <div class="mt-4 h-4 bg-slate-100 rounded w-32"></div>
            </div>
          </div>

          <!-- Real Stats Grid -->
          <div *ngIf="!isLoading && stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">Total Members</p>
                  <p class="text-3xl font-bold text-slate-800">{{stats.totalMembers || 0}}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="absolute right-0 top-0 w-24 h-24 bg-cyan-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">Active Committees</p>
                  <p class="text-3xl font-bold text-slate-800">{{stats.activeCommittees || 0}} / {{stats.totalCommittees || 0}}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">Pending Payments</p>
                  <p class="text-3xl font-bold text-slate-800">{{stats.pendingPayments || 0}}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <p class="text-sm font-medium text-slate-500 mb-1">Total Collection</p>
                  <p class="text-3xl font-bold text-slate-800">Rs {{stats.totalCollected | number}}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <!-- Skeleton Loader for Table -->
             <div *ngIf="isLoading" class="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden animate-pulse">
                <div class="p-6 border-b border-slate-100"><div class="h-6 bg-slate-200 rounded w-48"></div></div>
                <div class="p-6 space-y-4">
                   <div *ngFor="let i of [1,2,3,4]" class="flex justify-between">
                      <div class="h-4 bg-slate-200 rounded w-32"></div>
                      <div class="h-4 bg-slate-200 rounded w-24"></div>
                      <div class="h-4 bg-slate-200 rounded w-16"></div>
                   </div>
                </div>
             </div>

             <!-- Real Recent Activity -->
             <div *ngIf="!isLoading && transactions" class="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col animate-fade-in-up">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                   <h2 class="text-lg font-bold text-slate-800">Recent Transactions</h2>
                   <button class="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                </div>
                <div class="overflow-x-auto">
                   <table class="w-full text-left border-collapse">
                      <thead>
                         <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th class="px-6 py-4 font-medium">Member</th>
                            <th class="px-6 py-4 font-medium">Committee</th>
                            <th class="px-6 py-4 font-medium">Amount</th>
                            <th class="px-6 py-4 font-medium">Status</th>
                            <th class="px-6 py-4 font-medium">Date</th>
                         </tr>
                      </thead>
                      <tbody class="text-sm divide-y divide-slate-100">
                         <tr *ngIf="transactions.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-slate-500">No recent transactions found.</td>
                         </tr>
                         <tr *ngFor="let tx of transactions" class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                               <img [src]="'https://ui-avatars.com/api/?name=' + tx.memberName + '&background=random'" class="w-8 h-8 rounded-full">
                               {{tx.memberName}}
                            </td>
                            <td class="px-6 py-4 text-slate-600">{{tx.committeeId?.name || 'N/A'}}</td>
                            <td class="px-6 py-4 font-medium text-slate-800">Rs {{tx.amount | number}}</td>
                            <td class="px-6 py-4">
                              <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                                    [ngClass]="{
                                      'bg-green-100 text-green-700': tx.status === 'paid',
                                      'bg-orange-100 text-orange-700': tx.status === 'pending',
                                      'bg-red-100 text-red-700': tx.status === 'late'
                                    }">
                                {{tx.status | titlecase}}
                              </span>
                            </td>
                            <td class="px-6 py-4 text-slate-500">{{tx.createdAt | date:'mediumDate'}}</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>

             <!-- Action items -->
             <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in-up">
                <h2 class="text-lg font-bold text-slate-800 mb-6">Quick Actions</h2>
                <div class="space-y-4">
                   <button class="w-full flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all group text-slate-700 font-medium shadow-sm hover:shadow">
                      <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      </div>
                      Create New Committee
                   </button>
                   <button class="w-full flex items-center p-4 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 transition-all group text-slate-700 font-medium shadow-sm hover:shadow">
                      <div class="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                      </div>
                      Add New Member
                   </button>
                   <button class="w-full flex items-center p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all group text-slate-700 font-medium shadow-sm hover:shadow">
                      <div class="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      Approve Payments
                   </button>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  isLoading = true;
  stats: any = null;
  transactions: any[] = [];
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.error = '';
    
    // Simulate slight network delay for premium feel of loading states
    setTimeout(() => {
      this.apiService.getDashboardStats().subscribe({
        next: (data) => {
          this.stats = data;
          this.fetchTransactions();
        },
        error: (err) => {
          this.error = 'Failed to load dashboard data. Please make sure the backend is running.';
          this.isLoading = false;
        }
      });
    }, 600);
  }

  fetchTransactions() {
    this.apiService.getRecentTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load recent transactions.';
        this.isLoading = false;
      }
    });
  }
}
