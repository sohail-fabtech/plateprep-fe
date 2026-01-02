import { UserProfile } from '../auth/types';

// ----------------------------------------------------------------------

/**
 * Check if user has an active subscription/plan
 */
export function hasSubscription(profile: UserProfile | null): boolean {
  if (!profile) return false;

  // Super admin doesn't need subscription
  if (profile.is_super === true) return true;

  const plan = profile.resturant?.plan;

  // Plan is null or undefined
  if (!plan) return false;

  // Plan is an empty object
  if (typeof plan === 'object' && Object.keys(plan).length === 0) return false;

  // Plan exists and has content
  return true;
}

/**
 * Check if subscription is required for the user
 * (Non-super admin users need subscription)
 */
export function requiresSubscription(profile: UserProfile | null): boolean {
  if (!profile) return true;
  if (profile.is_super === true) return false;
  return true;
}

