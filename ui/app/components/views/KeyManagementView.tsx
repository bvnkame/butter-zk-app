import React, { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import Card from '../Card';
import Button from '../Button';
import KeyIcon from '../icons/KeyIcon';
import ConfirmationModal from '../ConfirmationModal';

const KeyDisplay: React.FC<{ label: string, value: string, isSecret?: boolean }> = ({ label, value, isSecret = false }) => {
    const [isVisible, setIsVisible] = useState(!isSecret);
    const [copied, setCopied] = useState(false);
    const displayValue = isVisible ? value : '•'.repeat(64);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="text-sm font-medium text-slate-400">{label}</label>
            <div className="flex items-center space-x-2 mt-1">
                <p className={`flex-1 font-mono text-sm p-2 bg-slate-900 rounded break-all ${isSecret && !isVisible ? 'blur-sm select-none' : ''}`}>
                    {displayValue}
                </p>
                {isSecret && (
                    <Button variant="secondary" size="sm" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? 'Hide' : 'Show'}
                    </Button>
                )}
                <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
        </div>
    );
};


const KeyManagementView: React.FC = () => {
    const { keyPair, handleGenerateKeys } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onConfirmRegenerate = () => {
        handleGenerateKeys();
        setIsModalOpen(false);
    };
    
    return (
        <>
            <Card title="Key Pair Management" icon={<KeyIcon />}>
                {!keyPair ? (
                    <div className="text-center">
                        <p className="text-slate-400 mb-4">Generate a new Nostr key pair to get started.</p>
                        <Button onClick={handleGenerateKeys}>Generate Keys</Button>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="space-y-4 flex-grow">
                            <KeyDisplay label="Private Key (hex)" value={keyPair.priv} isSecret />
                            <KeyDisplay label="Public Key (hex)" value={keyPair.pub} />
                            <KeyDisplay label="Public Key (npub)" value={keyPair.npub} />
                        </div>
                         <div className="pt-6 mt-6 border-t border-slate-700">
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                variant="destructive"
                            >
                                Regenerate Key Pair
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={onConfirmRegenerate}
                title="Regenerate Key Pair?"
                confirmText="Regenerate"
            >
                <p>Are you sure you want to regenerate your key pair? Your current keys will be permanently lost. This action cannot be undone.</p>
            </ConfirmationModal>
        </>
    );
};

export default KeyManagementView;
