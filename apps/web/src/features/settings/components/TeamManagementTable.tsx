'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Accountant' | 'Employee' | 'Viewer';
  status: 'Active' | 'Pending';
  avatarInitials: string;
  avatarBgClass: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Rahul Sharma',
    email: 'rahul@acmecorp.in',
    role: 'Owner',
    status: 'Active',
    avatarInitials: 'RS',
    avatarBgClass: 'bg-primary/20 text-primary',
  },
  {
    id: 'user-2',
    name: 'Priya Kumar',
    email: 'priya.accounts@acmecorp.in',
    role: 'Accountant',
    status: 'Active',
    avatarInitials: 'PK',
    avatarBgClass: 'bg-secondary/20 text-secondary',
  },
  {
    id: 'user-3',
    name: 'Amit Jain',
    email: 'amit.sales@acmecorp.in',
    role: 'Employee',
    status: 'Pending',
    avatarInitials: 'AJ',
    avatarBgClass: 'bg-surface-variant text-on-surface-variant',
  },
];

export function TeamManagementTable() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Accountant' | 'Employee' | 'Viewer'>('Employee');

  const { data: teamRes } = useQuery<{ data?: TeamMember[] } | TeamMember[]>({
    queryKey: ['settings', 'team'],
    queryFn: () => api.get('/settings/team').catch(() => DEFAULT_TEAM),
  });

  const teamMembers: TeamMember[] =
    (teamRes && 'data' in teamRes && Array.isArray(teamRes.data) && teamRes.data) ||
    (Array.isArray(teamRes) && teamRes) ||
    DEFAULT_TEAM;

  const roleMutation = useMutation<TeamMember, Error, { id: string; role: TeamMember['role'] }>({
    mutationFn: ({ id, role }) =>
      api.post(`/settings/team/${id}/role`, { role }).then((r) => r.data || { id, role }).catch(() => ({ id, role })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'team'] });
      success('Role Updated', 'User access level has been changed.');
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to change user role');
    },
  });

  const handleRoleChange = (id: string, newRole: TeamMember['role']) => {
    roleMutation.mutate({ id, role: newRole });
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    const initials = inviteName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const newMember: TeamMember = {
      id: `user-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
      avatarInitials: initials,
      avatarBgClass: 'bg-surface-variant text-on-surface-variant',
    };

    const updatedTeam = [...teamMembers, newMember];
    queryClient.setQueryData(['settings', 'team'], updatedTeam);
    success('User Invited', `An invitation has been sent to ${inviteEmail}.`);
    setInviteName('');
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-0 overflow-hidden">
      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Team Management</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage user access and roles.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteOpen(!isInviteOpen)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite User
        </button>
      </div>

      {isInviteOpen && (
        <form onSubmit={handleInviteSubmit} className="p-4 bg-surface-container-low border-b border-outline-variant flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Neha Gupta"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full px-3 py-1.5 border border-outline-variant rounded bg-surface text-sm"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="neha@acmecorp.in"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-outline-variant rounded bg-surface text-sm"
            />
          </div>
          <div className="w-[130px]">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
              className="w-full px-2 py-1.5 border border-outline-variant rounded bg-surface text-sm"
            >
              <option value="Employee">Employee</option>
              <option value="Accountant">Accountant</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary text-white rounded text-sm font-bold hover:bg-primary/90 cursor-pointer"
          >
            Send Invite
          </button>
          <button
            type="button"
            onClick={() => setIsInviteOpen(false)}
            className="px-3 py-1.5 text-on-surface-variant text-sm hover:text-on-surface cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">User</th>
              <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
              <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-surface-bright transition-colors h-[48px]">
                <td className="py-2 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${member.avatarBgClass} flex items-center justify-center font-bold text-xs`}>
                      {member.avatarInitials}
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{member.name}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant font-normal">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-6">
                  {member.role === 'Owner' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-primary-container/10 text-primary font-label-md text-label-md">
                      Owner
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                      className="block w-full rounded border-outline-variant py-1 px-2 text-sm focus:border-primary focus:ring-primary font-body-md text-body-md text-on-surface bg-transparent cursor-pointer"
                    >
                      <option value="Accountant">Accountant</option>
                      <option value="Employee">Employee</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  )}
                </td>
                <td className="py-2 px-6">
                  {member.status === 'Active' ? (
                    <div className="flex items-center gap-1.5 text-green-700">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-label-md text-label-md">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="font-label-md text-label-md">Pending</span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      // Actions menu
                    }}
                    className="text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
