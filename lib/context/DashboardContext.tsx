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
});

export const useDashboard = () => useContext(DashboardContext);
