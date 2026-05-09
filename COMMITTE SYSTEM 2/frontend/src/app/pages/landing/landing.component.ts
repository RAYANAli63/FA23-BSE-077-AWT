import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      <!-- Navbar -->
      <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">M</div>
            <span class="font-bold text-xl tracking-tight text-slate-900">Money Committee</span>
          </div>
          <div class="hidden md:flex items-center space-x-8 font-medium text-slate-600">
            <a href="#features" class="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" class="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#testimonials" class="hover:text-indigo-600 transition-colors">Testimonials</a>
          </div>
          <div class="flex items-center gap-4">
            <a routerLink="/member/login" class="hidden md:block font-medium text-slate-600 hover:text-indigo-600 transition-colors">Log In</a>
            <a routerLink="/signup" class="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-md hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95">Get Started</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div class="absolute inset-0 z-0">
          <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl"></div>
          <div class="absolute top-40 -left-40 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl"></div>
        </div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8 animate-fade-in-up">
            <span class="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            The Future of Group Savings
          </div>
          <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-fade-in-up animation-delay-100">
            Start Saving Smartly with <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">ROSCA Committees</span>
          </h1>
          <p class="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            Manage your rotating savings and credit associations securely. Track payments, receive payouts, and grow together in a transparent, modern platform.
          </p>
          <div class="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up animation-delay-300">
            <a routerLink="/signup" class="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1">
              Create an Account
            </a>
            <a routerLink="/admin/login" class="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 font-semibold text-lg transition-all hover:-translate-y-1">
              Admin Portal
            </a>
          </div>
        </div>
      </div>
      
      <!-- Preview Dashboard Image Mockup -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-24">
        <div class="rounded-2xl shadow-2xl border border-slate-200/50 bg-white/50 backdrop-blur-xl p-2 sm:p-4 animate-fade-in-up animation-delay-400">
          <div class="rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 aspect-[16/9] flex items-center justify-center relative">
             <!-- Fake dashboard UI for preview -->
             <div class="absolute inset-0 flex flex-col p-6 pointer-events-none">
                <div class="flex justify-between items-center mb-8">
                  <div class="h-8 w-48 bg-slate-200 rounded-lg"></div>
                  <div class="flex gap-4"><div class="h-10 w-10 bg-slate-200 rounded-full"></div></div>
                </div>
                <div class="grid grid-cols-3 gap-6 mb-8">
                  <div class="h-32 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between"><div class="h-4 w-24 bg-slate-100 rounded"></div><div class="h-8 w-32 bg-indigo-100 rounded"></div></div>
                  <div class="h-32 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between"><div class="h-4 w-24 bg-slate-100 rounded"></div><div class="h-8 w-32 bg-green-100 rounded"></div></div>
                  <div class="h-32 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between"><div class="h-4 w-24 bg-slate-100 rounded"></div><div class="h-8 w-32 bg-cyan-100 rounded"></div></div>
                </div>
                <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <div class="h-6 w-48 bg-slate-100 rounded mb-6"></div>
                  <div class="space-y-4">
                    <div class="h-12 bg-slate-50 rounded-lg"></div>
                    <div class="h-12 bg-slate-50 rounded-lg"></div>
                    <div class="h-12 bg-slate-50 rounded-lg"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent {}
