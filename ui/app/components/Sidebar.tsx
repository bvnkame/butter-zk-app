
import React from 'react';
import KeyIcon from './icons/KeyIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import EditIcon from './icons/EditIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import HistoryIcon from './icons/HistoryIcon';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  closeSidebar?: () => void; // Optional function to close sidebar on mobile
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  viewName: string;
  activeView: string;
  onClick: (view: string) => void;
}> = ({ icon, label, viewName, activeView, onClick }) => {
  const isActive = activeView === viewName;
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(viewName);
      }}
      className={`flex items-center px-4 py-3 text-lg rounded-lg transition-colors ${
        isActive
          ? 'bg-violet-600 text-white font-semibold shadow-lg'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <span className="mr-4">{icon}</span>
      {label}
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, closeSidebar }) => {
    
  const handleNavClick = (view: string) => {
    setActiveView(view);
    if (closeSidebar) {
        closeSidebar();
    }
  }

  return (
    <aside className="bg-slate-800/80 backdrop-blur-md text-white w-64 space-y-6 py-7 px-2 h-full flex flex-col">
      <div className="text-white text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">
        Butter Key
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem
          icon={<KeyIcon />}
          label="Key Management"
          viewName="keys"
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          icon={<UserPlusIcon />}
          label="Admins"
          viewName="admins"
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          icon={<EditIcon />}
          label="Signer"
          viewName="signer"
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          icon={<ShieldCheckIcon />}
          label="Policy Editor"
          viewName="policyEditor"
          activeView={activeView}
          onClick={handleNavClick}
        />
         <NavItem
          icon={<HistoryIcon />}
          label="Active Policies"
          viewName="activePolicies"
          activeView={activeView}
          onClick={handleNavClick}
        />
      </nav>
      <div className="text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Butter Key Management</p>
      </div>
    </aside>
  );
};

export default Sidebar;