export const OBJECT_PERMISSION_KEYS = [
  "canCreate",
  "canRead",
  "canUpdate",
  "canDelete",
  "canViewAll",
  "canEditAll",
] as const;

export type ObjectPermissionKey = (typeof OBJECT_PERMISSION_KEYS)[number];

export interface ObjectAccessPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canEditAll: boolean;
}

export interface ObjectPermissionDefinition {
  name: string;
}

export interface SavedObjectPermission extends ObjectAccessPermissions {
  object: ObjectPermissionDefinition;
}

export const EMPTY_OBJECT_PERMISSIONS: ObjectAccessPermissions = {
  canCreate: false,
  canRead: false,
  canUpdate: false,
  canDelete: false,
  canViewAll: false,
  canEditAll: false,
};

function copyPermissions(permissions: ObjectAccessPermissions): ObjectAccessPermissions {
  return {
    canCreate: permissions.canCreate,
    canRead: permissions.canRead,
    canUpdate: permissions.canUpdate,
    canDelete: permissions.canDelete,
    canViewAll: permissions.canViewAll,
    canEditAll: permissions.canEditAll,
  };
}

export function buildObjectPermissionState(
  objects: ObjectPermissionDefinition[],
  savedPermissions: SavedObjectPermission[] = [],
): Record<string, ObjectAccessPermissions> {
  const savedByName = new Map(
    savedPermissions.map((permission) => [permission.object.name.toLocaleLowerCase(), permission]),
  );
  const state: Record<string, ObjectAccessPermissions> = {};

  for (const object of objects) {
    const saved = savedByName.get(object.name.toLocaleLowerCase());
    state[object.name] = saved
      ? copyPermissions(saved)
      : { ...EMPTY_OBJECT_PERMISSIONS };
  }

  for (const permission of savedPermissions) {
    if (!Object.keys(state).some((name) => name.toLocaleLowerCase() === permission.object.name.toLocaleLowerCase())) {
      state[permission.object.name] = copyPermissions(permission);
    }
  }

  return state;
}

export function updateObjectPermission(
  state: Record<string, ObjectAccessPermissions>,
  objectName: string,
  key: ObjectPermissionKey,
  checked: boolean,
): Record<string, ObjectAccessPermissions> {
  const next = {
    ...EMPTY_OBJECT_PERMISSIONS,
    ...state[objectName],
    [key]: checked,
  };

  if (key === "canRead" && !checked) {
    next.canViewAll = false;
    next.canEditAll = false;
  } else if (key === "canEditAll" && checked) {
    next.canViewAll = true;
    next.canRead = true;
    next.canUpdate = true;
  } else if (key === "canViewAll" && checked) {
    next.canRead = true;
  }

  return { ...state, [objectName]: next };
}

export function hasAnyObjectPermission(
  permissions: Record<string, ObjectAccessPermissions>,
): boolean {
  return Object.values(permissions).some((objectPermissions) =>
    OBJECT_PERMISSION_KEYS.some((key) => objectPermissions[key]),
  );
}
