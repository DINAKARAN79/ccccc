import { describe, expect, it } from "vitest";
import {
  buildObjectPermissionState,
  EMPTY_OBJECT_PERMISSIONS,
  hasAnyObjectPermission,
  updateObjectPermission,
} from "./permission-set-object-permissions";

describe("permission set object permissions", () => {
  it("initializes permissions for every object and hydrates saved grants case-insensitively", () => {
    const state = buildObjectPermissionState(
      [{ name: "Lead" }, { name: "Booking" }],
      [{
        object: { name: "lead" },
        ...EMPTY_OBJECT_PERMISSIONS,
        canRead: true,
      }],
    );

    expect(state).toEqual({
      Lead: { ...EMPTY_OBJECT_PERMISSIONS, canRead: true },
      Booking: EMPTY_OBJECT_PERMISSIONS,
    });
  });

  it("preserves saved permissions for objects no longer in the active object list", () => {
    const state = buildObjectPermissionState([], [{
      object: { name: "ArchivedObject" },
      ...EMPTY_OBJECT_PERMISSIONS,
      canRead: true,
    }]);

    expect(state.ArchivedObject.canRead).toBe(true);
  });

  it("maintains read and update prerequisites for broad object access", () => {
    const editAll = updateObjectPermission({}, "Booking", "canEditAll", true);
    expect(editAll.Booking).toMatchObject({
      canRead: true,
      canUpdate: true,
      canViewAll: true,
      canEditAll: true,
    });

    const noRead = updateObjectPermission(editAll, "Booking", "canRead", false);
    expect(noRead.Booking).toMatchObject({
      canRead: false,
      canViewAll: false,
      canEditAll: false,
    });
  });

  it("detects grants on any object", () => {
    expect(hasAnyObjectPermission({ Lead: EMPTY_OBJECT_PERMISSIONS })).toBe(false);
    expect(hasAnyObjectPermission({
      Booking: { ...EMPTY_OBJECT_PERMISSIONS, canCreate: true },
    })).toBe(true);
  });
});
