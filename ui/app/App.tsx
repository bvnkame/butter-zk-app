
import React, { useState, useEffect, createContext, useContext } from 'react';
// FIX: Module '"firebase/auth"' has no exported member 'onAuthStateChanged' and 'User'. Changed import from 'firebase/auth' to '@firebase/auth' to fix module resolution issues.
import { onAuthStateChanged } from '@firebase/auth';
import type { User as FirebaseUser } from '@firebase/auth';
import { auth } from './services/firebase';
import type { User } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Set this to true to bypass login for development and testing
const TEST_MODE = false;

// A mock user object that satisfies the FirebaseUser interface for testing
const mockUser: FirebaseUser = {
  uid: 'mock-uid-123',
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=Test%20User&backgroundColor=ab47bc,42a5f5,aed581,f28022,e53935`,
  providerId: 'mock',
  emailVerified: true,
  isAnonymous: false,
  // FIX: Added the missing 'phoneNumber' property to the 'mockUser' object to conform to the 'FirebaseUser' type.
  phoneNumber: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-token',
  tenantId: null,
  delete: async () => console.log('Mock user delete called'),
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    token: 'mock-id-token',
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => console.log('Mock user reload called'),
  toJSON: () => ({
    uid: 'mock-uid-123',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=Test%20User&backgroundColor=ab47bc,42a5f5,aed581,f28022,e53935`,
    phoneNumber: null,
  }),
};

// 1. Create Auth Context
const AuthContext = createContext<{ user: User }>({ user: null });

// 2. Create Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (TEST_MODE) {
      setUser(mockUser);
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-400"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

// 3. Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();
  
  return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
          {user ? <Dashboard user={user} /> : <Login />}
      </div>
  );
};


export default App;
