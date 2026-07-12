'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Loader2 } from 'lucide-react';
import { Role } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { InputFormField } from '../../../components/ui/InputFormField';

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface InviteUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STAFF);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole(Role.STAFF);
  };

  const inviteMutation = useMutation<unknown, Error, InviteUserPayload>({
    mutationFn: (payload) => api.post('/organizations/current/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'current', 'users'] });
      toastSuccess('Team Member Invited', 'New team member has been added successfully.');
      resetForm();
      onClose();
    },
    onError: (err: Error) => {
      toastError('Invitation Failed', err.message || 'Failed to invite team member.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toastError('Validation Error', 'Please complete all required fields.');
      return;
    }
    inviteMutation.mutate({ name, email, password, role });
  };

  const handleModalClose = () => {
    if (inviteMutation.isPending) return;
    resetForm();
    onClose();
  };

  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Invite Team Member"
      description="Add a new member to your organization and assign role-based access permissions."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputFormField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Priya Kumar"
          required
          disabled={inviteMutation.isPending}
        />

        <InputFormField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="priya.kumar@acmecorp.in"
          required
          disabled={inviteMutation.isPending}
        />

        <InputFormField
          label="Password / Initial Key"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          disabled={inviteMutation.isPending}
          helperText="Minimum 6 characters required for security authentication."
        />

        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="role-select"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Assigned Role
            <span className="ml-1 text-error">*</span>
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={inviteMutation.isPending}
            className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <option value={Role.OWNER}>OWNER (Full administrative access & billing)</option>
            <option value={Role.ACCOUNTANT}>ACCOUNTANT (Read-only settings & full invoicing/audit access)</option>
            <option value={Role.STAFF}>STAFF (Operational tasks, no settings access)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={inviteMutation.isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="flex items-center gap-2 bg-primary text-white font-label-lg px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Inviting...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Send Invitation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ModalDrawer>
  );
}
