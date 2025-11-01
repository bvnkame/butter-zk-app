

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import Card from '../Card';
import ShieldCheckIcon from '../icons/ShieldCheckIcon';
import Button from '../Button';
import CheckIcon from '../icons/CheckIcon';
import UserIcon from '../icons/UserIcon';

const PolicyEditorView: React.FC = () => {
    const { admins, policyNpub, setPolicyNpub, policyContent, setPolicyContent, handleSetPolicy } = useDashboard();
    const [isApplied, setIsApplied] = useState(false);

    const onApplyClick = () => {
        handleSetPolicy();
        setIsApplied(true);
        setTimeout(() => {
            setIsApplied(false);
        }, 2500);
    };

    // Auto-select an admin if the current one is removed, or select the first one if none is selected
    useEffect(() => {
        if (policyNpub && !admins.includes(policyNpub)) {
            // The currently selected admin was removed, so select the new first admin or clear
            setPolicyNpub(admins.length > 0 ? admins[0] : '');
        } else if (!policyNpub && admins.length > 0) {
            // No admin is selected, so select the first one
            setPolicyNpub(admins[0]);
        }
    }, [admins, policyNpub, setPolicyNpub]);

    // Reset the "Applied!" button state if the user changes the admin or edits the policy
    useEffect(() => {
        setIsApplied(false);
    }, [policyNpub, policyContent]);
    
    return (
        <Card title="Policy Editor" icon={<ShieldCheckIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin List */}
                <div className="md:col-span-1 bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">Select Admin</h3>
                    {admins.length > 0 ? (
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {admins.map(admin => (
                                <li key={admin}>
                                    <button
                                        onClick={() => setPolicyNpub(admin)}
                                        className={`w-full flex items-center text-left p-3 rounded-md transition-colors ${
                                            policyNpub === admin 
                                            ? 'bg-violet-600 text-white shadow-md' 
                                            : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                                        }`}
                                    >
                                        <UserIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                        <span className="font-mono text-sm truncate">{admin}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                            <p className="text-sm text-slate-500 px-2">Add admins in the 'Admins' tab to create policies.</p>
                        </div>
                    )}
                </div>

                {/* Policy Editor */}
                <div className="md:col-span-2 flex flex-col">
                    {policyNpub ? (
                        <>
                            <label className="block text-sm font-medium text-slate-400 mb-2 truncate">
                                Policy for: <span className="font-mono text-violet-400">{policyNpub}</span>
                            </label>
                            <textarea
                                className="w-full flex-grow p-3 font-mono text-xs bg-slate-900 border border-slate-600 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                value={policyContent}
                                onChange={(e) => setPolicyContent(e.target.value)}
                                style={{minHeight: '250px'}}
                            />
                            <div className="mt-4">
                                <Button
                                    onClick={onApplyClick}
                                    className="w-full"
                                    disabled={!policyNpub || !policyContent.trim() || isApplied}
                                    variant={isApplied ? 'secondary' : 'primary'}
                                    icon={isApplied ? <CheckIcon className="w-5 h-5" /> : undefined}
                                >
                                    {isApplied ? 'Policy Applied!' : 'Apply Policy'}
                                </Button>
                            </div>
                        </>
                    ) : (
                         <div className="flex items-center justify-center h-full text-center p-8 border-2 border-dashed border-slate-700 rounded-lg">
                            <div>
                                <ShieldCheckIcon className="mx-auto h-12 w-12 text-slate-500" />
                                <h3 className="mt-2 text-sm font-medium text-slate-300">No Admin Selected</h3>
                                <p className="mt-1 text-sm text-slate-500">Select an admin from the list to view or edit their policy.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default PolicyEditorView;
