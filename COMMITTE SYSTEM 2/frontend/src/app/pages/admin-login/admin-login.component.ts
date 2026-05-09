import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
         <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
         <div class="absolute top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/20 blur-3xl"></div>
      </div>
      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/50">A</div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">Admin Secure Portal</h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-2xl sm:px-10 border border-slate-700">
          <form class="space-y-6" action="#" method="POST">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-300">Admin Email</label>
              <div class="mt-1">
                <input id="email" name="email" type="email" required class="appearance-none block w-full px-3 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white shadow-sm placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-300">Password</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white shadow-sm placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
              </div>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all shadow-indigo-500/30">
                Authenticate
              </button>
            </div>
            
            <div class="text-center pt-4 border-t border-slate-700/50">
               <a routerLink="/" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Return to Home</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {}
