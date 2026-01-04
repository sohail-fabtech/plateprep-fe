import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IUserDetail } from '../../@types/userApi';
import {
  getUserById,
  getUsers,
  createUser,
  deleteUser,
  restoreUser,
  permanentlyDeleteUser,
  updateUser,
  updateProfile,
  updateUserIndividualPermissions,
  changePassword,
  UserQueryParams,
  UserListResponse,
  UpdateUserIndividualPermissionsRequest,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from './userService';

// Re-export UserQueryParams and UserListResponse for use in other modules
export type { UserQueryParams, UserListResponse };

// ----------------------------------------------------------------------

/**
 * Query key factory for users
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
};

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: string | number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch list of users
 */
export function useUsers(params?: UserQueryParams) {
  return useQuery<UserListResponse>({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}

/**
 * Hook to delete user (soft delete / archive)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to restore archived user
 */
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to permanently delete user
 */
export function usePermanentlyDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => permanentlyDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to create user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateUserRequest }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update profile
 * Used for updating the current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateUserRequest }) => updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update user individual permissions
 */
export function useUpdateUserIndividualPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserIndividualPermissionsRequest) => updateUserIndividualPermissions(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.user_id) });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
}

// Re-export response types
export type { RestoreUserResponse, PermanentlyDeleteUserResponse } from '../../@types/userApi';
export type { UpdateUserIndividualPermissionsRequest } from './userService';

