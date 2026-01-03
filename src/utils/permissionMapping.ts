import { IPermission } from '../@types/roleApi';

// ----------------------------------------------------------------------
// Permission Mapping Utilities
// ----------------------------------------------------------------------

/**
 * Maps API codename to module and action
 * Example: "view_recipe" -> { moduleCode: "RECIPES", actionCode: "READ" }
 */
export function mapCodenameToModuleAction(codename: string): { moduleCode: string; actionCode: string } | null {
  if (!codename) return null;

  // Split codename by underscore
  const parts = codename.toLowerCase().split('_');
  if (parts.length < 2) return null;

  // Extract action (first part) and module (remaining parts)
  const action = parts[0];
  const module = parts.slice(1).join('_');

  // Map action to action code
  const actionMap: Record<string, string> = {
    view: 'READ',
    read: 'READ',
    add: 'CREATE',
    create: 'CREATE',
    edit: 'UPDATE',
    update: 'UPDATE',
    delete: 'DELETE',
    remove: 'DELETE',
    manage: 'MANAGE',
  };

  const actionCode = actionMap[action] || action.toUpperCase();

  // Convert module to module code (capitalize and replace underscores)
  const moduleCode = module
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .toUpperCase();

  return { moduleCode, actionCode };
}

/**
 * Generates UI permission ID from module and action
 * Example: "RECIPES", "READ" -> "RECIPES_READ"
 */
export function generatePermissionId(moduleCode: string, actionCode: string): string {
  return `${moduleCode}_${actionCode}`;
}

/**
 * Converts API permission IDs array to UI permission IDs array
 * @param apiIds Array of API permission IDs (numbers)
 * @param permissionsData Full permissions array from API
 * @returns Array of UI permission IDs (strings like "RECIPES_READ")
 */
export function convertApiIdsToUiPermissionIds(
  apiIds: number[],
  permissionsData: IPermission[]
): string[] {
  if (!apiIds || !Array.isArray(apiIds) || !permissionsData || !Array.isArray(permissionsData)) {
    return [];
  }

  const uiIds: string[] = [];

  apiIds.forEach((apiId) => {
    const permission = permissionsData.find((p) => p.id === apiId);
    if (permission) {
      const mapped = mapCodenameToModuleAction(permission.codename);
      if (mapped) {
        const uiId = generatePermissionId(mapped.moduleCode, mapped.actionCode);
        uiIds.push(uiId);
      }
    }
  });

  return uiIds;
}

/**
 * Converts UI permission IDs array to API permission IDs array
 * @param uiIds Array of UI permission IDs (strings like "RECIPES_READ")
 * @param permissionsData Full permissions array from API
 * @returns Array of API permission IDs (numbers)
 */
export function convertUiPermissionIdsToApiIds(
  uiIds: string[],
  permissionsData: IPermission[]
): number[] {
  if (!uiIds || !Array.isArray(uiIds) || !permissionsData || !Array.isArray(permissionsData)) {
    return [];
  }

  const apiIds: number[] = [];

  uiIds.forEach((uiId) => {
    // Parse UI ID: "RECIPES_READ" -> { module: "RECIPES", action: "READ" }
    const [moduleCode, actionCode] = uiId.split('_');
    if (!moduleCode || !actionCode) return;

    // Find matching permission by codename
    // Convert module and action back to codename format
    const moduleName = moduleCode
      .toLowerCase()
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '');
    
    const actionName = actionCode.toLowerCase();
    
    // Try different codename patterns
    const possibleCodenames = [
      `${actionName}_${moduleName}`,
      `${actionName}_${moduleName.replace(/_/g, '')}`,
    ];

    const permission = permissionsData.find((p) => {
      const mapped = mapCodenameToModuleAction(p.codename);
      if (mapped) {
        const permissionUiId = generatePermissionId(mapped.moduleCode, mapped.actionCode);
        return permissionUiId === uiId;
      }
      return false;
    });

    if (permission) {
      apiIds.push(permission.id);
    }
  });

  return apiIds;
}

