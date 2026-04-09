'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Profile, Report } from '@/types';
import { apiClient } from '@/lib/utils';

interface DashboardContextType {
  user: User | null;
  profiles: Profile[];
  selectedProfile: Profile | null;
  reports: Report[];
  loading: boolean;
  reportsLoading: boolean;
  setSelectedProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
  refreshReports: () => Promise<void>;
  logout: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiClient<{ user: User }>('/api/auth/me');
        setUser(data.user);
      } catch {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Fetch profiles when user is loaded
  const refreshProfiles = useCallback(async () => {
    try {
      const data = await apiClient<{ profiles: Profile[] }>('/api/profiles');
      setProfiles(data.profiles);
      // Select default profile if none selected
      if (!selectedProfile && data.profiles.length > 0) {
        const defaultProfile =
          data.profiles.find((p) => p.is_default) || data.profiles[0];
        setSelectedProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (user) {
      refreshProfiles();
    }
  }, [user, refreshProfiles]);

  // Fetch reports when selected profile changes
  const refreshReports = useCallback(async () => {
    if (!selectedProfile) return;
    setReportsLoading(true);
    try {
      const data = await apiClient<{ reports: Report[] }>(
        `/api/reports?profileId=${selectedProfile.id}`
      );
      setReports(data.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setReportsLoading(false);
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (selectedProfile) {
      refreshReports();
    }
  }, [selectedProfile, refreshReports]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        user,
        profiles,
        selectedProfile,
        reports,
        loading,
        reportsLoading,
        setSelectedProfile,
        refreshProfiles,
        refreshReports,
        logout,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
