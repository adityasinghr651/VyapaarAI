/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserSessionDto } from '@vyapaarai/shared-types';
import api from '../../lib/api-client';
import { useStore } from '../../store/useStore';
import { useToast } from '../ui/Toast';

interface AuthPayload {
  user?: UserSessionDto;
  token?: string;
}

interface AuthApiResponse {
  message?: string;
  data?: AuthPayload;
  user?: UserSessionDto;
  token?: string;
}

export function StitchLoginForm() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post<AuthApiResponse>('/auth/login', { email, password });
      const authData: AuthPayload | undefined =
        (response as AuthApiResponse)?.data || (response as unknown as AuthPayload);
      const user = authData?.user || (response as unknown as AuthApiResponse)?.user;
      const token = authData?.token || (response as unknown as AuthApiResponse)?.token;

      if (user && token) {
        setUser(user, token);
        success('Authentication Successful', `Welcome back, ${user.name}! Accessing dashboard...`);
        router.push('/dashboard');
      } else {
        throw new Error('Authentication response did not return a valid session.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please verify your credentials and try again.';
      setErrorMsg(message);
      toastError('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[40%] bg-surface-container-lowest flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* Mobile Brand Header */}
        <div className="md:hidden mb-10 text-center">
          <h1 className="font-display text-display text-[#004ac6] font-black tracking-tight">VyaparAI</h1>
        </div>
        <div className="mb-10">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back to VyaparAI</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Securely access your institutional dashboard.</p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 flex items-start space-x-2.5 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/40 p-3 text-[#93000a] text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] shrink-0 mt-0.5">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="email">
              Business Email
            </label>
            <div className="relative halo-focus rounded transition-all duration-200">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none focus:border-[#004ac6] placeholder:text-outline/60"
                id="email"
                name="email"
                placeholder="admin@company.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="password">
                Password
              </label>
              <a className="font-label-md text-label-md text-[#004ac6] hover:text-[#2563eb] transition-colors" href="#">
                Forgot Password?
              </a>
            </div>
            <div className="relative halo-focus rounded transition-all duration-200">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none focus:border-[#004ac6] placeholder:text-outline/60"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded bg-[#004ac6] text-[#ffffff] font-label-md text-label-md uppercase tracking-wider hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004ac6] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md uppercase">
                Or
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button
              className="w-full flex justify-center items-center py-3 px-4 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <img
                alt="Google logo"
                className="h-5 w-5 mr-3"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0biwZyOyFwPHkIBsIFchAQMKcU3PJNuHX8BAN9pp8AoU0odlhpDEcUS_O-ouYEVwPp52XnUGvyi7W4nuy-yWjZBXNbXtoOSmZcY-KDLL9nmX5ZpcFReVLoH48Xs5PnJbV38_juEr47fKqzohSWK4kaifCMwAdYNjdVjRDxuRxqMAQJIdh0YZj81EtnUOHJFLKvBLi5VTzHZLBYcDQegKKTl9K5F8trucfOtQSQlLsxqGgrEfQlRaMhvmqiroBHYNPmHl0GjaVq9u6"
              />
              Continue with Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link className="font-label-md text-label-md text-[#004ac6] hover:text-[#2563eb] transition-colors uppercase" href="/signup">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="mt-auto pt-12">
        <div className="flex flex-wrap justify-center items-center gap-6 text-on-surface-variant/80">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="font-label-md text-[11px] uppercase tracking-wider">Secure 256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span className="font-label-md text-[11px] uppercase tracking-wider">GST Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span className="font-label-md text-[11px] uppercase tracking-wider">Data Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
