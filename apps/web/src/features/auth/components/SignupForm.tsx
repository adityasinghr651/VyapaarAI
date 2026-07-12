'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Shield, UserPlus, AlertCircle } from 'lucide-react';
import { Role, UserSessionDto } from '@vyapaarai/shared-types';
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

export function SignupForm() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.ACCOUNTANT);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post<AuthApiResponse>('/auth/register', {
        name,
        email,
        password,
        role,
      });
      const authData: AuthPayload | undefined =
        (response as AuthApiResponse)?.data || (response as unknown as AuthPayload);
      const user = authData?.user || (response as unknown as AuthApiResponse)?.user;
      const token = authData?.token || (response as unknown as AuthApiResponse)?.token;

      if (user && token) {
        setUser(user, token);
        success('Registration Successful', `Account created! Welcome to VyapaarAI, ${user.name}.`);
        router.push('/dashboard');
      } else {
        throw new Error('Registration response did not return a valid session.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please verify your inputs and check email uniqueness.';
      setErrorMsg(message);
      toastError('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="max-w-md w-full shadow-lg border border-outline-variant relative overflow-hidden p-8 animate-in fade-in duration-300">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none -mr-8 -mt-8"></div>

      <div className="flex items-center space-x-2.5 mb-2">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <UserPlus size={22} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
          Create Account
        </h2>
      </div>
      <p className="text-on-surface-variant text-sm mb-6">
        Sign up for an SMB organization account to start issuing compliance-led invoices.
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-start space-x-2.5 rounded-lg bg-error-container border border-error/30 p-3 text-error text-xs font-medium"
        >
          <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputFormField
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          leftIcon={<User size={16} />}
        />

        <InputFormField
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
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

        {/* Role Responsibility Selection */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="signup-role"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Role Responsibility <span className="ml-0.5 text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-on-surface-variant/70">
              <Shield size={16} />
            </div>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              required
              className="w-full rounded-lg py-2.5 pl-10 pr-3 text-sm text-on-surface bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value={Role.ACCOUNTANT}>Accountant</option>
              <option value={Role.OWNER}>Business Owner</option>
            </select>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Determines dashboard approval permissions and audit visibility.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 bg-primary hover:bg-primary/90 active:scale-95 transition-all text-white font-semibold rounded-xl text-sm shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>{loading ? 'Registering Account...' : 'Register'}</span>
        </button>
      </form>

      <div className="mt-6 border-t border-outline-variant pt-5 text-center text-xs text-on-surface-variant">
        Already have an active account?{' '}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </GlassCard>
  );
}
