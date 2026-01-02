import { useAuthContext } from '../auth/useAuthContext';
import { hasSubscription, requiresSubscription } from '../utils/subscription';

// ----------------------------------------------------------------------

export function useSubscription() {
  const { user } = useAuthContext();

  return {
    profile: user,
    hasSubscription: () => hasSubscription(user),
    requiresSubscription: () => requiresSubscription(user),
    isSuperAdmin: user?.is_super === true,
  };
}

