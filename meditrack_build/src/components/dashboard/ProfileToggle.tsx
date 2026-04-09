'use client';

import { useState } from 'react';
import { Plus, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/context/DashboardContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Profile } from '@/types';

const relationships = [
  { value: 'parent', label: 'Parent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'other', label: 'Other' },
];

export default function ProfileToggle() {
  const { profiles, selectedProfile, setSelectedProfile, refreshProfiles } =
    useDashboard();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('parent');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    setError('');

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), relationship: newRelationship }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await refreshProfiles();
      setShowAddModal(false);
      setNewName('');
      setNewRelationship('parent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add profile');
    } finally {
      setAdding(false);
    }
  };

  const getInitials = (profile: Profile) => {
    if (profile.name === 'Myself') return '👤';
    return profile.name.charAt(0).toUpperCase();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-500">Profiles</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => setSelectedProfile(profile)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              selectedProfile?.id === profile.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:bg-blue-50'
            )}
          >
            <span className="text-base">{getInitials(profile)}</span>
            {profile.name}
          </button>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-blue-600 border border-dashed border-blue-300 hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Family
        </button>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError('');
        }}
        title="Add Family Member"
        size="sm"
      >
        <form onSubmit={handleAddProfile} className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-blue-700">
              Add a family member to track their health reports separately.
            </p>
          </div>

          <Input
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Relationship
            </label>
            <select
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {relationships.map((rel) => (
                <option key={rel.value} value={rel.value}>
                  {rel.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={adding}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
