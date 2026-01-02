import { UserProfile } from '../auth/types';

/**
 * Maps API profile to include legacy properties for backward compatibility
 */
export function mapProfileToLegacyFormat(profile: any): UserProfile {
  if (!profile) return profile;

  // Create displayName from first_name + last_name
  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.displayName || profile.name || '';

  // Map profile_image_url to photoURL
  const photoURL = profile.profile_image_url || profile.photoURL || null;

  // Map phone_number to phoneNumber
  const phoneNumber = profile.phone_number || profile.phoneNumber || '';

  // Map address fields
  const address = profile.street_address || profile.address || '';
  const state = profile.state_province || profile.state || '';
  const zipCode = profile.postal_code || profile.zipCode || '';

  return {
    ...profile,
    displayName,
    photoURL,
    phoneNumber,
    address,
    state,
    zipCode,
  };
}

