
import { createContext, useContext } from 'react';
import type { KeyPair, SignedEvent, Policies } from '../types';

interface DashboardContextType {
  keyPair: KeyPair | null;
  admins: string[];
  newAdmin: string;
  contentToSign: string;
  signedEvents: SignedEvent[];
  policies: Policies;
  policyNpub: string;
  policyContent: string;
  
  setKeyPair: (keyPair: KeyPair | null) => void;
  setAdmins: (admins: string[]) => void;
  setNewAdmin: (newAdmin: string) => void;
  setContentToSign: (content: string) => void;
  setSignedEvents: (events: SignedEvent[]) => void;
  setPolicies: (policies: Policies) => void;
  setPolicyNpub: (npub: string) => void;
  setPolicyContent: (content: string) => void;

  handleGenerateKeys: () => void;
  handleAddAdmin: () => void;
  handleRemoveAdmin: (admin: string) => void;
  handleSignContent: () => void;
  handleSetPolicy: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
