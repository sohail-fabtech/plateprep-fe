import { useMemo, useState } from 'react';
// @mui
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Divider,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
// @types
import { IPermission } from '../../@types/roleApi';
// utils
import { mapCodenameToModuleAction, generatePermissionId } from '../../utils/permissionMapping';

// ----------------------------------------------------------------------

type Props = {
  permissions: IPermission[];
  selectedPermissions: string[]; // UI permission IDs like "RECIPES_READ"
  onChange: (selectedPermissions: string[]) => void;
  isLoading?: boolean;
  error?: Error | null;
  formInputSx?: object;
};

type PermissionGroup = {
  moduleCode: string;
  permissions: Array<{
    uiId: string;
    apiId: number;
    name: string;
    codename: string;
    actionCode: string;
  }>;
};

export default function PermissionMatrix({
  permissions,
  selectedPermissions,
  onChange,
  isLoading = false,
  error = null,
  formInputSx,
}: Props) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Group permissions by module
  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    if (!permissions || permissions.length === 0) return [];

    const groupsMap = new Map<string, PermissionGroup['permissions']>();

    permissions.forEach((permission) => {
      const mapped = mapCodenameToModuleAction(permission.codename);
      if (mapped) {
        const uiId = generatePermissionId(mapped.moduleCode, mapped.actionCode);
        const moduleCode = mapped.moduleCode;

        if (!groupsMap.has(moduleCode)) {
          groupsMap.set(moduleCode, []);
        }

        groupsMap.get(moduleCode)!.push({
          uiId,
          apiId: permission.id,
          name: permission.name,
          codename: permission.codename,
          actionCode: mapped.actionCode,
        });
      }
    });

    // Convert map to array and sort
    const groups: PermissionGroup[] = Array.from(groupsMap.entries())
      .map(([moduleCode, perms]) => ({
        moduleCode,
        permissions: perms.sort((a, b) => {
          // Sort by action order: READ, CREATE, UPDATE, DELETE, MANAGE
          const actionOrder: Record<string, number> = {
            READ: 1,
            CREATE: 2,
            UPDATE: 3,
            DELETE: 4,
            MANAGE: 5,
          };
          return (actionOrder[a.actionCode] || 99) - (actionOrder[b.actionCode] || 99);
        }),
      }))
      .sort((a, b) => a.moduleCode.localeCompare(b.moduleCode));

    // Expand all modules by default
    setExpandedModules(new Set(groups.map((g) => g.moduleCode)));

    return groups;
  }, [permissions]);

  const handleTogglePermission = (uiId: string) => {
    const isSelected = selectedPermissions.includes(uiId);
    if (isSelected) {
      onChange(selectedPermissions.filter((id) => id !== uiId));
    } else {
      onChange([...selectedPermissions, uiId]);
    }
  };

  const handleToggleModule = (moduleCode: string) => {
    const modulePermissions = permissionGroups.find((g) => g.moduleCode === moduleCode)?.permissions || [];
    const moduleUiIds = modulePermissions.map((p) => p.uiId);
    const allSelected = moduleUiIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all
      onChange(selectedPermissions.filter((id) => !moduleUiIds.includes(id)));
    } else {
      // Select all
      const newSelected = [...selectedPermissions];
      moduleUiIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  const handleToggleExpand = (moduleCode: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleCode)) {
      newExpanded.delete(moduleCode);
    } else {
      newExpanded.add(moduleCode);
    }
    setExpandedModules(newExpanded);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message || 'Failed to load permissions. Please try again.'}
      </Alert>
    );
  }

  if (permissionGroups.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No permissions available.
      </Alert>
    );
  }

  return (
    <Box>
      {permissionGroups.map((group) => {
        const moduleUiIds = group.permissions.map((p) => p.uiId);
        const selectedCount = moduleUiIds.filter((id) => selectedPermissions.includes(id)).length;
        const allSelected = selectedCount === moduleUiIds.length;
        const someSelected = selectedCount > 0 && selectedCount < moduleUiIds.length;
        const isExpanded = expandedModules.has(group.moduleCode);

        return (
          <Card key={group.moduleCode} sx={{ mb: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                bgcolor: 'background.neutral',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={() => handleToggleModule(group.moduleCode)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: 20, md: 24 },
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                        fontWeight: 700,
                        ml: 1,
                      }}
                    >
                      {group.moduleCode} ({selectedCount}/{moduleUiIds.length})
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    },
                  }}
                />
                <Button
                  size="small"
                  onClick={() => handleToggleExpand(group.moduleCode)}
                  sx={{
                    minWidth: 'auto',
                    fontSize: { xs: '0.75rem', md: '0.8125rem' },
                    px: 1,
                  }}
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </Stack>
            </Box>

            {isExpanded && (
              <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <FormGroup>
                  <Stack spacing={1.5}>
                    {group.permissions.map((permission) => (
                      <FormControlLabel
                        key={permission.uiId}
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(permission.uiId)}
                            onChange={() => handleTogglePermission(permission.uiId)}
                            sx={{
                              '& .MuiSvgIcon-root': {
                                fontSize: { xs: 20, md: 24 },
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            }}
                          >
                            {permission.name}
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          '& .MuiFormControlLabel-label': {
                            fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </FormGroup>
              </Box>
            )}
          </Card>
        );
      })}
    </Box>
  );
}

