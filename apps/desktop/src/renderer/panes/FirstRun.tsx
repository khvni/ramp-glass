import React, { useState } from 'react';

export const FirstRun = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(1);

    const handleGoogleSSO = async () => {
        try {
            await window.glass.invoke('sso:signIn', 'google');
        } catch(e) {
            console.error('SSO skipped or failed', e);
        }
        setStep(2);
    };

    const handleCodexAuth = async () => {
        try {
            await window.glass.invoke('codex:signIn');
        } catch(e) {
            console.error('Codex skipped or failed', e);
        }
        setStep(3);
    };

    const handleVaultSetup = async () => {
        try {
            await window.glass.invoke('vault:setup', { path: '/tmp/glass-vault-default', isNew: true });
        } catch(e) {
            console.error('Vault setup failed', e);
        }
        setStep(4);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-white p-6">
            <div className="max-w-xl w-full bg-gray-800 rounded-lg p-8 shadow-xl">
                {step === 1 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Welcome to Glass</h2>
                        <p className="text-gray-400 mb-8">Sign in with Google to automatically connect your Gmail, Calendar, and Drive.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-400 hover:text-white">Skip</button>
                            <button onClick={handleGoogleSSO} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium">Sign in with Google</button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Connect ChatGPT</h2>
                        <p className="text-gray-400 mb-8">Connect your existing ChatGPT account to give Glass access to GPT-5.4.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setStep(3)} className="px-4 py-2 text-gray-400 hover:text-white">Skip for now</button>
                            <button onClick={handleCodexAuth} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-medium">Connect ChatGPT</button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Setup Knowledge Base</h2>
                        <p className="text-gray-400 mb-8">Glass uses a local Vault folder to store your memory and indexed notes.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleVaultSetup} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium">Create Local Vault</button>
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-4">You're ready.</h2>
                        <p className="text-gray-400 mb-8">Glass is configured and ready to be your AI workspace.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={onComplete} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium">Start Workspace</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
