import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IRoleDetail, IPermission } from '../../@types/roleApi';
import {
  getRoleById,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  restoreRole,
  permanentlyDeleteRole,
  getPermissions,
  RoleQueryParams,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './roleService';

// Re-export RoleQueryParams and RoleListResponse for use in other modules
export type { RoleQueryParams, RoleListResponse };

// ----------------------------------------------------------------------

/**
 * Query key factory for roles
 */
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: RoleQueryParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...roleKeys.details(), id] as const,
};

/**
 * Query key factory for permissions
 */
export const permissionKeys = {
  all: ['permissions'] as const,
  list: () => [...permissionKeys.all, 'list'] as const,
};

/**
 * Hook to fetch a single role by ID
 */
export function useRole(id: string | number | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(id!),
    queryFn: () => getRoleById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch list of roles
 */
export function useRoles(params?: RoleQueryParams) {
  return useQuery<RoleListResponse>({
    queryKey: roleKeys.list(params),
    queryFn: () => getRoles(params),
  });
}

/**
 * Hook to fetch all permissions
 */
export function usePermissions() {
  return useQuery<IPermission[]>({
    queryKey: permissionKeys.list(),
    queryFn: () => getPermissions(),
  });
}

/**
 * Hook to create role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to update role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateRoleRequest }) => updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      // Invalidate user details as roles affect user permissions
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'users' && query.queryKey[1] === 'detail',
      });
    },
  });
}

/**
 * Hook to delete role (soft delete / archive)
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteRole(id),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.removeQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

/**
 * Hook to restore archived role
 */
export function useRestoreRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => restoreRole(id),
    onMutate: async (roleId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: roleKeys.lists() });

      // Snapshot previous state for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: roleKeys.lists() });

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: roleKeys.lists() }, (old: RoleListResponse | undefined) => {
        if (!old) return old;

        if (old.results && Array.isArray(old.results)) {
          return {
            ...old,
            results: old.results.map((role) =>
              role.id === roleId ? { ...role, is_deleted: false } : role
            ),
          };
        }

        return old;
      });

      return { previousQueries };
    },
    onSuccess: () => {
      // Refetch in background to ensure consistency
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error, roleId, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}

/**
 * Hook to permanently delete role
 */
export function usePermanentlyDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => permanentlyDeleteRole(id),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.removeQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

// Re-export response types
export type { RestoreRoleResponse, PermanentlyDeleteRoleResponse } from '../../@types/roleApi';

