import { type ObjectsPermissions } from 'twenty-shared/types';

import { computePermissionUnion } from 'src/engine/twenty-orm/utils/compute-permission-union.util';

describe('computePermissionUnion', () => {
  const companyObjectMetadataId = 'company-object-id';
  const taskObjectMetadataId = 'task-object-id';
  const nameFieldMetadataId = 'name-field-id';
  const amountFieldMetadataId = 'amount-field-id';

  it('should return empty object for empty array', () => {
    expect(computePermissionUnion([])).toEqual({});
  });

  it('should return same permissions for single role', () => {
    const permissions: ObjectsPermissions = {
      [companyObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    };

    expect(computePermissionUnion([permissions])).toEqual(permissions);
  });

  it('should grant object operations allowed by any role', () => {
    const salesRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
      [taskObjectMetadataId]: {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    };
    const automationRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
      [taskObjectMetadataId]: {
        canReadObjectRecords: false,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    };

    expect(
      computePermissionUnion([salesRolePermissions, automationRolePermissions]),
    ).toMatchObject({
      [companyObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
      },
      [taskObjectMetadataId]: {
        canReadObjectRecords: false,
        canUpdateObjectRecords: true,
      },
    });
  });

  it('should only keep field restrictions when no role grants that field operation', () => {
    const restrictedRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {
          [nameFieldMetadataId]: {
            canRead: false,
            canUpdate: false,
          },
          [amountFieldMetadataId]: {
            canRead: false,
            canUpdate: false,
          },
        },
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    };
    const readOnlyRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {
          [nameFieldMetadataId]: {
            canRead: null,
            canUpdate: false,
          },
        },
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    };

    expect(
      computePermissionUnion([
        restrictedRolePermissions,
        readOnlyRolePermissions,
      ])[companyObjectMetadataId].restrictedFields,
    ).toEqual({
      [amountFieldMetadataId]: {
        canRead: false,
        canUpdate: false,
      },
    });
  });
});
