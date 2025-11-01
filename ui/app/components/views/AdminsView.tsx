import React, { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import Card from '../Card';
import Button from '../Button';
import Input from '../Input';
import UserPlusIcon from '../icons/UserPlusIcon';
import TrashIcon from '../icons/TrashIcon';
import UserIcon from '../icons/UserIcon';
import ConfirmationModal from '../ConfirmationModal';

const AdminsView: React.FC = () => {
    const { admins, newAdmin, setNewAdmin, handleAddAdmin, handleRemoveAdmin } = useDashboard();
    const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
    
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleAddAdmin();
        }
    };

    const confirmDelete = (admin: string) => {
        setAdminToDelete(admin);
    };

    const executeDelete = () => {
        if (adminToDelete) {
            handleRemoveAdmin(adminToDelete);
            setAdminToDelete(null);
        }
    };

    return (
        <>
            <Card title="Admin Npubs" icon={<UserPlusIcon />}>
                <div className="relative">
                    <Input 
                        type="text" 
                        placeholder="Enter admin npub..." 
                        value={newAdmin} 
                        onChange={(e) => setNewAdmin(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-20"
                    />
                    <Button 
                        onClick={handleAddAdmin} 
                        className="absolute right-1.5 top-1/2 -translate-y-1/2"
                        size="sm"
                    >
                        Add
                    </Button>
                </div>
                
                <ul className="mt-6 space-y-3">
                    {admins.map(admin => (
                        <li 
                            key={admin} 
                            className="flex items-center justify-between bg-slate-700/50 hover:bg-slate-700 transition-colors p-3 rounded-lg"
                        >
                            <div className="flex items-center min-w-0">
                                <span className="text-slate-400 mr-3 flex-shrink-0">
                                    <UserIcon className="w-5 h-5" />
                                </span>
                                <p className="font-mono text-sm text-slate-200 truncate" title={admin}>
                                    {admin}
                                </p>
                            </div>
                            <button
                                onClick={() => confirmDelete(admin)}
                                className="p-2 rounded-full text-slate-400 hover:bg-red-900/50 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 ml-4 flex-shrink-0"
                                aria-label={`Remove admin ${admin}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                    {admins.length === 0 && (
                        <li className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                            <UserPlusIcon className="mx-auto h-12 w-12 text-slate-500" />
                            <h3 className="mt-2 text-sm font-medium text-slate-300">No Admins</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by adding an admin npub.</p>
                        </li>
                    )}
                </ul>
            </Card>

            <ConfirmationModal
                isOpen={!!adminToDelete}
                onClose={() => setAdminToDelete(null)}
                onConfirm={executeDelete}
                title="Remove Admin?"
                confirmText="Delete"
            >
                <p>Are you sure you want to remove this admin?</p>
                <p className="font-mono text-xs bg-slate-900 p-2 mt-2 rounded break-all text-slate-300">
                    {adminToDelete}
                </p>
                <p className="mt-2">Any policies linked to this admin will also be removed.</p>
            </ConfirmationModal>
        </>
    );
};

export default AdminsView;
