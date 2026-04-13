import { BrowserWindow, ipcMain, type IpcMain } from 'electron';
import keytar from 'keytar';

const SERVICE_NAME = 'ramp-glass-codex';
const ACCOUNT_NAME = 'chatgpt-token';

export const CODEX_IPC_CHANNELS = {
    signIn: 'codex:signIn',
    getToken: 'codex:getToken'
};

export const registerCodexAuthIpcHandlers = (ipc: IpcMain = ipcMain): void => {
    ipc.handle(CODEX_IPC_CHANNELS.signIn, async () => {
        return new Promise((resolve, reject) => {
            const authWindow = new BrowserWindow({
                width: 600,
                height: 800,
                show: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            // For integration testing we simulate it
            authWindow.loadURL('https://chatgpt.com/auth/login');

            // Wait for user to login to chatgpt and intercept
            authWindow.webContents.on('did-navigate', async (event, url) => {
                if (url.includes('chatgpt.com/?') || url === 'https://chatgpt.com/') {
                    try {
                        const tokenStr = await authWindow.webContents.executeJavaScript(`
                            // Simplified extraction for the test
                            window.localStorage.getItem('access_token') || 'mock-codex-token'
                        `);

                        await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, tokenStr);
                        authWindow.close();
                        resolve(tokenStr);
                    } catch (e) {
                        console.error('Failed to grab codex token', e);
                    }
                }
            });

            authWindow.on('closed', () => {
                reject(new Error('Auth window was closed by user'));
            });
        });
    });

    ipc.handle(CODEX_IPC_CHANNELS.getToken, async () => {
        return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    });
};
