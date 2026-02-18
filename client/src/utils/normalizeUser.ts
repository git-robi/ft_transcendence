import type { PublicUser } from '../types';

/**
 * Normalize various API user/profile shapes into the frontend `PublicUser`.
 * Supports: { user: { ... } }, full user object, profile object, and combined objects.
 */
export function normalizeApiUser(raw: any): PublicUser {
  const data = raw?.user ?? raw;
  const id = Number(data?.id ?? data?.userId ?? 0);
  const email = data?.email ?? '';
  const name =
    data?.name ??
    data?.profile?.name ??
    raw?.name ??
    raw?.profile?.name ??
    '';

  return { id, name: name || '', email };
}

export default normalizeApiUser;
