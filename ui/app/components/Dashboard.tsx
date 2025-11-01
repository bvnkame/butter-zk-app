

import React, { useState, useCallback, useEffect } from 'react';
// FIX: Module '"firebase/auth"' has no exported member 'User'. Changed import from 'firebase/auth' to '@firebase/auth' to fix module resolution issues.
import type { User } from '@firebase/auth';
import type { KeyPair, SignedEvent, Policies } from '../types';
import { nostrService } from '../services/nostrService';
import { DashboardContext } from '../contexts/DashboardContext';
import Header from './Header';
import Sidebar from './Sidebar';

// Import views
import KeyManagementView from './views/KeyManagementView';
import AdminsView from './views/AdminsView';
import SignerView from './views/SignerView';
import PolicyEditorView from './views/PolicyEditorView';
import ActivePoliciesView from './views/ActivePoliciesView';

const defaultPolicy =
`service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
    // State Management
    const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
    const [admins, setAdmins] = useState<string[]>([]);
    const [newAdmin, setNewAdmin] = useState('');
    const [contentToSign, setContentToSign] = useState('');
    const [signedEvents, setSignedEvents] = useState<SignedEvent[]>([]);
    const [policies, setPolicies] = useState<Policies>({});
    const [policyNpub, setPolicyNpub] = useState('');
    const [policyContent, setPolicyContent] = useState(defaultPolicy);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState('keys'); // Default view

    // Handlers
    const handleGenerateKeys = useCallback(() => {
        const newKeyPair = nostrService.generateKeys();
        setKeyPair(newKeyPair);
    }, []);

    const handleAddAdmin = useCallback(() => {
        if (newAdmin.trim() && !admins.includes(newAdmin.trim())) {
            setAdmins(prev => [...prev, newAdmin.trim()]);
            setNewAdmin('');
        }
    }, [newAdmin, admins]);

    const handleRemoveAdmin = useCallback((adminToRemove: string) => {
        setAdmins(prev => prev.filter(admin => admin !== adminToRemove));
    }, []);

    const handleSignContent = useCallback(() => {
        if (!keyPair || !contentToSign.trim()) return;
        try {
            const signedEvent = nostrService.signContent(keyPair.priv, contentToSign.trim());
            setSignedEvents(prev => [signedEvent, ...prev]);
            setContentToSign('');
        } catch (error) {
            console.error("Error signing content:", error);
        }
    }, [keyPair, contentToSign]);
    
    const handleSetPolicy = useCallback(() => {
        if (!policyNpub || !policyContent.trim()) return;
        setPolicies(prev => ({ ...prev, [policyNpub]: policyContent.trim() }));
    }, [policyNpub, policyContent]);
    

    useEffect(() => {
        
        (async () => { 
            let accounts;
            try {
              // Accounts is an array of string Mina addresses.
              accounts = await (window as any).mina.requestAccounts();
    
              // Show first 6 and last 4 characters of user's Mina account.
              const display = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
            } catch (err : any) {
              // If the user has a wallet installed but has not created an account, an
              // exception will be thrown. Consider showing "not connected" in your UI.
              console.log(err.message);
            }
        })();
    
    }, []);

    
    // Effect to load policy when admin is selected
    useEffect(() => {
        if (policyNpub) {
            const existingPolicy = policies[policyNpub];
            setPolicyContent(existingPolicy || defaultPolicy);
        } else {
            setPolicyContent(defaultPolicy);
        }
    }, [policyNpub, policies]);

    const contextValue = {
        keyPair, setKeyPair,
        admins, setAdmins,
        newAdmin, setNewAdmin,
        contentToSign, setContentToSign,
        signedEvents, setSignedEvents,
        policies, setPolicies,
        policyNpub, setPolicyNpub,
        policyContent, setPolicyContent,
        handleGenerateKeys,
        handleAddAdmin,
        handleRemoveAdmin,
        handleSignContent,
        handleSetPolicy
    };
    
    const renderActiveView = () => {
        switch(activeView) {
            case 'keys':
                return <KeyManagementView />;
            case 'admins':
                return <AdminsView />;
            case 'signer':
                return <SignerView />;
            case 'policyEditor':
                return <PolicyEditorView />;
            case 'activePolicies':
                return <ActivePoliciesView />;
            default:
                return <KeyManagementView />;
        }
    }

    return (
        <DashboardContext.Provider value={contextValue}>
            <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
                {/* Mobile Sidebar Overlay */}
                <div 
                    className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setSidebarOpen(false)}
                />
                
                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:static lg:inset-0`}>
                    <Sidebar activeView={activeView} setActiveView={setActiveView} closeSidebar={() => setSidebarOpen(false)} />
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header user={user} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8">
                        {renderActiveView()}
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    );
};

export default Dashboard;