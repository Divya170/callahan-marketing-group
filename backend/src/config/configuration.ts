import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  databasePath: string;
  dbSynchronize: boolean;
  frontendOrigin: string;
  adminPasscode: string;
  appSecret: string;
  adminSessionHours: number;
}

export const DEFAULT_ADMIN_PASSCODE = 'callahan';

/** Resolves runtime configuration from environment variables with safe defaults. */
export function loadConfig(): AppConfig {
  const databasePath = resolve(process.cwd(), process.env.DATABASE_PATH || '../database/app.sqlite');
  const dir = dirname(databasePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  return {
    port: Number(process.env.PORT) || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    databasePath,
    dbSynchronize: (process.env.DB_SYNCHRONIZE ?? 'true') !== 'false',
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    adminPasscode: process.env.ADMIN_PASSCODE || DEFAULT_ADMIN_PASSCODE,
    appSecret: process.env.APP_SECRET || 'dev-only-secret-change-me',
    adminSessionHours: Number(process.env.ADMIN_SESSION_HOURS) || 8,
  };
}

export default () => ({ app: loadConfig() });
