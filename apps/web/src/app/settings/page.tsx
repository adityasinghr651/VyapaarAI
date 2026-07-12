import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { SettingsWorkspace } from '../../features/settings/components/SettingsWorkspace';

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsWorkspace />
    </AppShell>
  );
}
