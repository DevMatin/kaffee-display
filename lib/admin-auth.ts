import { createHash } from 'crypto';

const COOKIE_NAME = 'kaffee-admin-session';
const COOKIE_PATH = '/admin';
const HASH_SALT = 'kaffee-admin-sidecar';

function getAdminPassword() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return process.env.ADMIN_PASSWORD;
}

export function getAdminAuthToken() {
  const password = getAdminPassword();
  return createHash('sha256').update(`${password}-${HASH_SALT}`).digest('hex');
}

export function isValidAdminToken(token: string | undefined) {
  if (!token) {
    return false;
  }
  return token === getAdminAuthToken();
}

export function isValidAdminPassword(password: string) {
  return password === getAdminPassword();
}

export const ADMIN_AUTH_COOKIE = {
  name: COOKIE_NAME,
  path: COOKIE_PATH,
};

