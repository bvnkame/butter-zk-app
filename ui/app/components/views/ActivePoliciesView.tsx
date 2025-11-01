
import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import Card from '../Card';
import HistoryIcon from '../icons/HistoryIcon';

const ActivePoliciesView: React.FC = () => {
    const { policies } = useDashboard();
    
    return (
         <Card title="Active Policies" icon={<HistoryIcon />}>
            {Object.keys(policies).length > 0 ? (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2 bg-slate-900/50 rounded">
                    {Object.entries(policies).map(([npub, policy]) => (
                        <div key={npub} className="bg-slate-800 p-4 rounded-lg">
                            <p className="font-mono text-sm text-violet-400 truncate mb-2" title={npub}>
                                Policy for: {npub}
                            </p>
                            <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded mt-1 whitespace-pre-wrap break-all">
                                {policy}
                            </pre>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-slate-400 text-center py-4">No policies have been applied yet.</p>
            )}
        </Card>
    );
};

export default ActivePoliciesView;
