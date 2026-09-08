'use client';

import React, { createContext, useContext } from 'react';
import { Profile, LinkItem, ContactInfo } from '@/types';

interface DashboardContextType {
  profile: Profile | null;
  links: LinkItem[];
  contact: ContactInfo | null;
  loading: boolean;
  refreshDashboard: () => void;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  setContact: React.Dispatch<React.SetStateAction<ContactInfo | null>>;
  openUpgradeModal?: () => void;
  openInviteModal?: () => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  profile: null,
  links: [],
  contact: null,
  loading: true,
  refreshDashboard: () => {},
  setProfile: () => {},
  setLinks: () => {},
  setContact: () => {},
  openUpgradeModal: () => {},
  openInviteModal: () => {},
});

export const useDashboard = () => useContext(DashboardContext);
