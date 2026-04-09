'use client';

import { useState } from 'react';
import { Settings, User, LogOut, Save, Loader2 } from 'lucide-react';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function SettingsContent() {
  const { user, logout } = useDashboard();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Settings className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        </div>
        <p className="text-sm text-slate-500">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-blue-50">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Profile</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number
            </label>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-2.5">
              {user?.phone || '—'}
            </p>
          </div>

          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving} size="sm">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600 font-medium">
                ✓ Saved successfully
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-red-50">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Account</h2>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Sign out of your MediTrack account on this device.
        </p>

        <Button variant="danger" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
            <SettingsContent />
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
