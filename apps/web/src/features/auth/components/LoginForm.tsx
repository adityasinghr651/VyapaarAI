'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { UserSessionDto } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { useStore } from '../../../store/useStore';
import { GlassCard } from '../../../components/ui/GlassCard';
import { InputFormField } from '../../../components/ui/InputFormField';
import { useToast } from '../../../components/ui/Toast';

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

export function LoginForm() {
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
    <GlassCard className="max-w-md w-full shadow-2xl relative overflow-hidden p-8 animate-in fade-in duration-300">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full filter blur-2xl pointer-events-none -mr-8 -mt-8"></div>

      <div className="flex items-center space-x-2.5 mb-2">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <LogIn size={22} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Welcome Back
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Sign in with your registered SMB credentials to manage your VyapaarAI dashboard.
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-start space-x-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 p-3 text-rose-300 text-xs font-medium"
        >
          <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputFormField
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@vyapaarai.com"
          leftIcon={<Mail size={16} />}
        />

        <InputFormField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-900/40 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogIn size={16} />
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>
      </form>

      <div className="mt-6 border-t border-slate-900 pt-5 text-center text-xs text-muted-foreground">
        Do not have a tenant account yet?{' '}
        <Link href="/signup" className="text-primary hover:underline font-semibold">
          Create one now
        </Link>
      </div>
    </GlassCard>
  );
}
