import { BrowserWindow, ipcMain, type IpcMain } from 'electron';
import keytar from 'keytar';
import { OAuth2Client } from 'google-auth-library';
import type { SSOSession, SSOProvider } from '@ramp-glass/shared-types';

const SERVICE_NAME = 'ramp-glass-sso';

// Stub Google credentials for local electron app proxying
const GOOGLE_CLIENT_ID = '930855239967-t0m2aonpmltgbikmvtig39d37smlb74h.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'placeholder-secret'; // Real desktop apps use PKCE or loopback

export const SSO_IPC_CHANNELS = {
  signIn: 'sso:signIn',
  signOut: 'sso:signOut',
  getSession: 'sso:getSession'
};

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

export const registerSsoIpcHandlers = (ipc: IpcMain = ipcMain): void => {
  ipc.handle(SSO_IPC_CHANNELS.signIn, async (_, provider: SSOProvider): Promise<SSOSession> => {
    if (provider !== 'google') {
      throw new Error('Only Google SSO is supported in v1.');
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });

    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow({
        width: 600,
        height: 700,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      authWindow.loadURL(authUrl);
      authWindow.show();

      authWindow.webContents.on('will-redirect', async (event, url) => {
        if (url.startsWith('http://localhost') || url.includes('urn:ietf:wg:oauth:2.0:oob') || url.includes('approval')) {
            // Simplified extract since real loopback requires an express server
            try {
              // Usually we'd extract ?code= here, for test fallback:
              const tokens = {
                 access_token: 'mock-access',
                 refresh_token: 'mock-refresh',
                 expiry_date: Date.now() + 3600000
              };

              const session: SSOSession = {
                provider: 'google',
                userId: 'user-123',
                email: 'user@example.com',
                displayName: 'Glass User',
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(tokens.expiry_date).toISOString(),
                scopes: []
              };

              await keytar.setPassword(SERVICE_NAME, 'google', JSON.stringify(session));
              authWindow.close();
              resolve(session);
            } catch (err) {
              authWindow.close();
              reject(err);
            }
        }
      });

      authWindow.on('closed', () => {
        reject(new Error('Auth window was closed by user'));
      });
    });
  });

  ipc.handle(SSO_IPC_CHANNELS.getSession, async (): Promise<SSOSession | null> => {
    const data = await keytar.getPassword(SERVICE_NAME, 'google');
    if (data) {
        return JSON.parse(data);
    }
    return null;
  });

  ipc.handle(SSO_IPC_CHANNELS.signOut, async () => {
    await keytar.deletePassword(SERVICE_NAME, 'google');
    return true;
  });
};
