// ----------------------------------------------------------------------

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export interface Permission {
  id: number;
  name: string;
  codename: string;
}

export interface UserRole {
  id: number;
  role_name: string;
  description: string;
  permissions: Permission[];
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_owner: boolean;
  is_super?: boolean;
  profile: string;
  profile_image_url: string | null;
  phone_number: string;
  date_of_birth: string | null;
  street_address: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  is_active: boolean;
  role_name: string;
  is_password_changed: boolean;
  is_deleted: boolean;
  resturant: any;
  branch: any;
  user_role: UserRole;
  individual_permissions: Permission[];
  // Legacy properties for backward compatibility with existing components
  displayName?: string;
  photoURL?: string | null | undefined;
  phoneNumber?: string;
  address?: string;
  state?: string;
  zipCode?: string;
  about?: string;
  isPublic?: boolean;
  [key: string]: any; // Allow additional properties for other auth providers
}

export type AuthUserType = UserProfile | null;

export type AuthStateType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
};

// ----------------------------------------------------------------------

export type JWTContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  profileLoading?: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
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
  }) => Promise<void>;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
};

export type FirebaseContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, firstName: string, lastName: string) => void;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
};

export type AWSCognitoContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, firstName: string, lastName: string) => void;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
};

export type Auth0ContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  // login: () => Promise<void>;
  logout: () => void;
  // To avoid conflicts between types this is just a temporary declaration.
  // Remove below when you choose to authenticate with Auth0.
  login: (email?: string, password?: string) => Promise<void>;
  register?: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
};
