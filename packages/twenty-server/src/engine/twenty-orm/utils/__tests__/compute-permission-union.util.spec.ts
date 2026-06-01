import { type ObjectsPermissions } from 'twenty-shared/types';

import { computePermissionUnion } from 'src/engine/twenty-orm/utils/compute-permission-union.util';

describe('computePermissionUnion', () => {
  const companyObjectMetadataId = 'company-object-metadata-id';
  const taskObjectMetadataId = 'task-object-metadata-id';
  const annualRecurringRevenueFieldMetadataId =
    'annual-recurring-revenue-field-metadata-id';

  const createObjectPermissions = (
    overrides: Partial<ObjectsPermissions[string]> = {},
  ): ObjectsPermissions[string] => ({
    canReadObjectRecords: false,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
    ...overrides,
  });

  it('should return empty object for empty array', () => {
    expect(computePermissionUnion([])).toEqual({});
  });

  it('should return same permissions for single role', () => {
    const permissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        canReadObjectRecords: true,
      }),
    };

    expect(computePermissionUnion([permissions])).toEqual(permissions);
  });

  it('should combine object permissions across roles', () => {
    const salesRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        canReadObjectRecords: true,
      }),
    };
    const automationRolePermissions: ObjectsPermissions = {
      [taskObjectMetadataId]: createObjectPermissions({
        canUpdateObjectRecords: true,
      }),
    };

    expect(
      computePermissionUnion([salesRolePermissions, automationRolePermissions]),
    ).toEqual({
      [companyObjectMetadataId]: createObjectPermissions({
        canReadObjectRecords: true,
      }),
      [taskObjectMetadataId]: createObjectPermissions({
        canUpdateObjectRecords: true,
      }),
    });
  });

  it('should keep field restrictions only when all roles with object permission restrict the field', () => {
    const restrictedSalesRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        restrictedFields: {
          [annualRecurringRevenueFieldMetadataId]: {
            canRead: false,
            canUpdate: false,
          },
        },
      }),
    };
    const unrestrictedSalesRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        restrictedFields: {},
      }),
    };

    expect(
      computePermissionUnion([
        restrictedSalesRolePermissions,
        unrestrictedSalesRolePermissions,
      ])[companyObjectMetadataId].restrictedFields,
    ).toEqual({
      [annualRecurringRevenueFieldMetadataId]: {
        canRead: null,
        canUpdate: false,
      },
    });
  });
});
