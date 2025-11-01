
import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { nostrService } from '../../services/nostrService';
import Card from '../Card';
import Button from '../Button';
import EditIcon from '../icons/EditIcon';
import HistoryIcon from '../icons/HistoryIcon';

const SignerView: React.FC = () => {
    const { keyPair, contentToSign, setContentToSign, signedEvents, handleSignContent } = useDashboard();

    return (
        <div className="grid grid-cols-1 gap-6">
            <Card title="Sign Content" icon={<EditIcon />}>
                <textarea
                    className="w-full h-24 p-2 bg-slate-800 border border-slate-600 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    placeholder="Enter content to sign with your key..."
                    value={contentToSign}
                    onChange={(e) => setContentToSign(e.target.value)}
                    disabled={!keyPair}
                />
                <Button onClick={handleSignContent} disabled={!keyPair || !contentToSign.trim()}>
                    Sign Content
                </Button>
            </Card>

            <Card title="Recent Signatures" icon={<HistoryIcon />}>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {signedEvents.length > 0 ? signedEvents.map(event => (
                        <div key={event.id} className="bg-slate-700/50 p-4 rounded-lg break-words">
                            <p className="text-slate-300 mb-2">"{event.content}"</p>
                            <div className="text-xs text-slate-400 space-y-1">
                                <p className="font-mono"><strong>ID:</strong> {event.id}</p>
                                <p className="font-mono"><strong>Signed by:</strong> {nostrService.npubEncode(event.pubkey)}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-400 text-center py-4">No content has been signed yet.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default SignerView;
