import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div class="flex items-center">
        <!-- Mobile menu button -->
        <button class="md:hidden mr-4 text-slate-500 hover:text-slate-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <h1 class="text-xl font-bold text-slate-800">{{title}}</h1>
      </div>
      <div class="flex items-center space-x-4">
        <button class="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
        <div class="h-8 w-px bg-slate-200 mx-2"></div>
        <div class="flex items-center cursor-pointer group">
          <img class="w-10 h-10 rounded-full border-2 border-slate-200 group-hover:border-indigo-400 transition-colors object-cover" src="https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff" alt="User Avatar">
          <div class="ml-3 hidden sm:block">
            <p class="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Test User</p>
            <p class="text-xs text-slate-500 capitalize">{{role}}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopbarComponent {
  @Input() title: string = 'Dashboard';
  @Input() role: string = 'member';
}
