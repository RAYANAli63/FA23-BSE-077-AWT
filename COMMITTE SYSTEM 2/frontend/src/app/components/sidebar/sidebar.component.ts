import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl hidden md:flex fixed left-0 top-0">
      <div class="h-20 flex items-center px-6 border-b border-slate-800">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-indigo-500/40">M</div>
        <span class="font-bold text-lg text-white tracking-wide">Committee</span>
      </div>
      <div class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <!-- Admin Links -->
        <ng-container *ngIf="role === 'admin'">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </a>
          <a routerLink="/admin/members" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Members
          </a>
          <a routerLink="/admin/committees" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Committees
          </a>
          <a routerLink="/admin/payments" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Payments
          </a>
          <a routerLink="/admin/reports" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Reports
          </a>
        </ng-container>

        <!-- Member Links -->
        <ng-container *ngIf="role === 'member'">
          <a routerLink="/member/dashboard" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </a>
          <a routerLink="/member/committees" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            My Committees
          </a>
          <a routerLink="/member/payments" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Make Payment
          </a>
          <a routerLink="/member/transactions" routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500" class="flex items-center px-4 py-3 rounded-xl border border-transparent hover:bg-slate-800 hover:text-white transition-all font-medium text-sm group">
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Transactions
          </a>
        </ng-container>
      </div>
      <div class="p-4 border-t border-slate-800">
         <a routerLink="/settings" class="flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors font-medium text-sm">
           <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           Settings
         </a>
         <a routerLink="/" class="flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 text-red-400 hover:text-red-300 transition-colors font-medium text-sm mt-1">
           <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
           Logout
         </a>
      </div>
    </div>
  `
})
export class SidebarComponent {
  @Input() role: 'admin' | 'member' = 'member';
}
