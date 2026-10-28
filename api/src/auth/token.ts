import { AUTH_COOKIE } from './auth.types.js';

const cookiePattern = new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`);

export const bearerToken = (header: unknown) =>
  typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice(7)
    : undefined;

export const cookieToken = (cookieHeader: string | undefined) =>
  cookieHeader?.match(cookiePattern)?.[1];
