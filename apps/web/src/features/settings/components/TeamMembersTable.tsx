'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { Role } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';
import { GlassCard } from '../../../components/ui/GlassCard';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useStore } from '../../../store/useStore';
import { InviteMemberModal } from './InviteMemberModal';

export interface UserMember {
  id: string;
  tenantId?: string;
  email: string;
  name: string;
  role: Role | string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
}

export interface UsersResponse {
  message?: string;
  data?: UserMember[];
}

export function TeamMembersTable() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const currentUser = useStore((state) => state.user);

  const isOwner = currentUser?.role === Role.OWNER;
  const isReadOnly = !isOwner;

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: responseData, isLoading } = useQuery<UsersResponse, Error>({
    queryKey: ['organizations', 'current', 'users'],
    queryFn: () => api.get('/organizations/current/users'),
  });

  const users: UserMember[] =
    responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? (responseData as unknown as UserMember[])
        : [];

  const updateRoleMutation = useMutation<unknown, Error, { userId: string; role: Role }>({
    mutationFn: ({ userId, role }) => api.put(`/organizations/current/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'current', 'users'] });
      toastSuccess('Role Updated', 'User role has been updated successfully.');
    },
    onError: (err: Error) => {
      toastError('Update Failed', err.message || 'Failed to update user role.');
    },
  });

  const handleRoleChange = (member: UserMember, newRole: Role) => {
    if (isReadOnly || updateRoleMutation.isPending) return;

    if (member.role === newRole) return;

    // Last OWNER safeguard
    if (member.role === Role.OWNER && newRole !== Role.OWNER) {
      const ownerCount = users.filter((u) => u.role === Role.OWNER || u.role === 'OWNER').length;
      if (ownerCount <= 1) {
        toastError(
          'Action Blocked',
          'Every organization must always have at least one OWNER. Cannot demote the last remaining OWNER.'
        );
        return;
      }
    }

    updateRoleMutation.mutate({ userId: member.id, role: newRole });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const columns: ColumnDef<UserMember>[] = [
    {
      header: 'Member',
      accessorKey: 'name',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
            {getInitials(item.name || item.email)}
          </div>
          <div>
            <div className="font-bold text-on-surface flex items-center gap-1.5">
              <span>{item.name}</span>
              {currentUser?.id === item.id && (
                <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
                  You
                </span>
              )}
            </div>
            <div className="text-xs text-on-surface-variant font-mono">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role Permissions',
      accessorKey: 'role',
      cell: (item) => {
        const isDemotingOrPromotingThisUser = updateRoleMutation.isPending && updateRoleMutation.variables?.userId === item.id;

        return (
          <div className="flex items-center gap-2">
            <select
              value={item.role}
              onChange={(e) => handleRoleChange(item, e.target.value as Role)}
              disabled={isReadOnly || updateRoleMutation.isPending}
              className="rounded-lg bg-surface-container-lowest border border-outline-variant py-1.5 px-2.5 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value={Role.OWNER}>OWNER</option>
              <option value={Role.ACCOUNTANT}>ACCOUNTANT</option>
              <option value={Role.STAFF}>STAFF</option>
            </select>
            {isDemotingOrPromotingThisUser && (
              <Loader2 size={14} className="animate-spin text-primary" />
            )}
          </div>
        );
      },
    },
    {
      header: 'Joined Date',
      accessorKey: 'createdAt',
      cell: (item) => {
        if (!item.createdAt) return <span className="text-on-surface-variant">—</span>;
        try {
          const date = new Date(item.createdAt);
          return (
            <span className="text-xs text-on-surface-variant">
              {date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          );
        } catch {
          return <span className="text-xs text-on-surface-variant">{item.createdAt}</span>;
        }
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item) => (
        <StatusBadge
          status={item.status || 'ACTIVE'}
          variant="success"
          size="sm"
          label={item.status || 'Active'}
        />
      ),
    },
  ];

  return (
    <GlassCard className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              Team Members &amp; Access Control
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant">
              Manage organization users, assign roles (OWNER, ACCOUNTANT, STAFF), and invite new collaborators.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          disabled={isReadOnly}
          className="flex items-center gap-2 bg-primary text-white font-label-lg px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus size={16} />
          <span>Invite Member</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyState={{
          title: 'No Team Members Found',
          description: 'Click "Invite Member" above to add your first collaborator to this workspace.',
        }}
      />

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </GlassCard>
  );
}
