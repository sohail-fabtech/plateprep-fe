import { createContext, useEffect, useReducer, useCallback, useMemo, useState } from 'react';
// utils
import axios from '../utils/axios';
import localStorageAvailable from '../utils/localStorageAvailable';
import { mapProfileToLegacyFormat } from '../utils/profileMapper';
import { hasSubscription } from '../utils/subscription';
// services
import { queryClient } from '../services';
// routes
import { PATH_DASHBOARD } from '../routes/paths';
//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [profileLoading, setProfileLoading] = useState(false);

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const accessToken = storageAvailable ? localStorage.getItem('accessToken') : '';

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        setProfileLoading(true);
        try {
          const profileResponse = await axios.get('/user-detail/profile/');
          const profile = mapProfileToLegacyFormat(profileResponse.data);

          dispatch({
            type: Types.INITIAL,
            payload: {
              isAuthenticated: true,
              user: profile,
            },
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Clear cache if profile fetch fails (invalid token, etc.)
          queryClient.clear();
          dispatch({
            type: Types.INITIAL,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        } finally {
          setProfileLoading(false);
        }
      } else {
        // Clear cache if no valid token exists
        queryClient.clear();
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      // Clear cache on initialization error
      queryClient.clear();
      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
      setProfileLoading(false);
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    // Clear all cached queries before login to ensure fresh data
    queryClient.clear();

    const response = await axios.post('/login/', {
      email,
      password,
    });
    const { access, refresh } = response.data;

    setSession(access, refresh);

    setProfileLoading(true);
    try {
      const profileResponse = await axios.get('/user-detail/profile/');
      const profile = mapProfileToLegacyFormat(profileResponse.data);

      dispatch({
        type: Types.LOGIN,
        payload: {
          user: profile,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // REGISTER
  const register = useCallback(
    async (payload: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      resturant: {
        resturant_name: string;
        street_address?: string;
        city?: string;
        state?: string;
        zipcode?: string;
        country?: string;
        phone?: string;
        email?: string;
        social_media?: Record<string, any>;
      };
    }) => {
      // Clear all cached queries before register to ensure fresh data
      queryClient.clear();

      const response = await axios.post('/register/', payload);
      const { access_token, refresh_token } = response.data;

      setSession(access_token, refresh_token);

      setProfileLoading(true);
      try {
        const profileResponse = await axios.get('/user-detail/profile/');
        const profile = mapProfileToLegacyFormat(profileResponse.data);

        dispatch({
          type: Types.REGISTER,
          payload: {
            user: profile,
          },
        });

        // Check if restaurant plan is empty - redirect to subscription page
        if (!hasSubscription(profile)) {
          window.location.href = PATH_DASHBOARD.subscription;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  // LOGOUT
  const logout = useCallback(() => {
    // Clear all cached queries on logout to prevent data leakage
    queryClient.clear();
    
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  const memoizedValue: JWTContextType = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      profileLoading,
      method: 'jwt',
      login,
      loginWithGoogle: () => {},
      loginWithGithub: () => {},
      loginWithTwitter: () => {},
      register,
      logout,
    }),
    [state.isAuthenticated, state.isInitialized, state.user, profileLoading, login, logout, register]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
