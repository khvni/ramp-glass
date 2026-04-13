import React, { useState, useEffect } from 'react';
import type { PaneComponent } from '../workspace/pane-registry.js';
import type { SSOSession } from '@ramp-glass/shared-types';

export const Settings: PaneComponent = () => {
    const [session, setSession] = useState<SSOSession | null>(null);
    const [codexToken, setCodexToken] = useState<string | null>(null);

    const load = async () => {
        try {
            const ss = await window.glass.invoke('sso:getSession');
            setSession(ss as SSOSession | null);
            const ct = await window.glass.invoke('codex:getToken');
            setCodexToken(ct as string | null);
        } catch(e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleGoogleSignOut = async () => {
        await window.glass.invoke('sso:signOut');
        await load();
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <div className="space-y-6">
                <section className="bg-gray-800 p-4 rounded border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Google SSO</h3>
                    {session ? (
                        <div>
                            <p className="mb-2">Signed in as: <strong>{session.email}</strong></p>
                            <button onClick={handleGoogleSignOut} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white font-medium">Sign out</button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-400 mb-2">Not signed in. Connect to Google to access Calendar and Drive.</p>
                            <button onClick={async () => { await window.glass.invoke('sso:signIn', 'google'); await load(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white font-medium">Sign In with Google</button>
                        </div>
                    )}
                </section>

                <section className="bg-gray-800 p-4 rounded border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">ChatGPT (Codex)</h3>
                    {codexToken ? (
                        <div>
                            <p className="mb-2 text-green-400">Connected to ChatGPT.</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-400 mb-2">Not connected. Connect to access GPT-5.4.</p>
                            <button onClick={async () => { await window.glass.invoke('codex:signIn'); await load(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white font-medium">Connect to ChatGPT</button>
                        </div>
                    )}
                </section>

                <section className="bg-gray-800 p-4 rounded border border-gray-700">
                   <h3 className="text-xl font-semibold mb-4 text-gray-300">Knowledge Base</h3>
                   <p className="text-gray-400 mb-2">Configure Vault settings.</p>
                   <button onClick={async () => { await window.glass.invoke('vault:setup', { path: '/tmp/glass-vault', isNew: true }); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white font-medium">Reset / Default Vault</button>
                </section>
            </div>
        </div>
    );
};
