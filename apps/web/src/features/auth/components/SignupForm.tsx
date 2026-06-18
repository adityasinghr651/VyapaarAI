'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api-client';
import { useStore } from '../../../store/useStore';
import { Role } from '@vyapaarai/shared-types';

export function SignupForm() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.ACCOUNTANT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response: any = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      setUser(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary rounded-full filter blur-2xl opacity-20 -mr-6 -mt-6"></div>

      <h2 className="text-3xl font-bold mb-2 tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
        Create Account
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Sign up to start issuing compliance-led invoices
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input w-full p-3 rounded-lg text-sm text-white focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input w-full p-3 rounded-lg text-sm text-white focus:outline-none"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input w-full p-3 rounded-lg text-sm text-white focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Role Responsibility
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="glass-input w-full p-3 rounded-lg text-sm text-white focus:outline-none bg-slate-900"
          >
            <option value={Role.ACCOUNTANT}>Accountant</option>
            <option value={Role.OWNER}>Business Owner</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold rounded-lg text-sm shadow-lg shadow-violet-900/40 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
}
