import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">M</div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900">Create your account</h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          Already have an account? <a routerLink="/member/login" class="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form class="space-y-6" action="#" method="POST">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-700">Full Name</label>
              <div class="mt-1">
                <input id="name" name="name" type="text" required class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
              </div>
            </div>
            
            <div>
              <label for="phone" class="block text-sm font-medium text-slate-700">Phone Number</label>
              <div class="mt-1">
                <input id="phone" name="phone" type="tel" required class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">Email address</label>
              <div class="mt-1">
                <input id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
              <div class="mt-1 relative">
                <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
              </div>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-indigo-500/30">
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {}
