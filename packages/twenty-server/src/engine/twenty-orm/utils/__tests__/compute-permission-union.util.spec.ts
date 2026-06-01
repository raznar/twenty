import {
  type ObjectsPermissions,
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { computePermissionUnion } from 'src/engine/twenty-orm/utils/compute-permission-union.util';

describe('computePermissionUnion', () => {
  const companyObjectMetadataId = 'company-object-metadata-id';
  const taskObjectMetadataId = 'task-object-metadata-id';
  const annualRecurringRevenueFieldMetadataId =
    'annual-recurring-revenue-field-metadata-id';
  const ownerFieldMetadataId = 'owner-field-metadata-id';

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

  const createRowLevelPermissionPredicate = (
    overrides: Partial<RowLevelPermissionPredicate> = {},
  ): RowLevelPermissionPredicate => ({
    id: 'row-level-permission-predicate-id',
    fieldMetadataId: ownerFieldMetadataId,
    objectMetadataId: companyObjectMetadataId,
    operand: RowLevelPermissionPredicateOperand.IS,
    value: 'workspace-member-id',
    subFieldName: null,
    workspaceMemberFieldMetadataId: null,
    workspaceMemberSubFieldName: null,
    roleId: 'role-id',
    ...overrides,
  });

  const createRowLevelPermissionPredicateGroup = (
    overrides: Partial<RowLevelPermissionPredicateGroup> = {},
  ): RowLevelPermissionPredicateGroup => ({
    id: 'row-level-permission-predicate-group-id',
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
    objectMetadataId: companyObjectMetadataId,
    parentRowLevelPermissionPredicateGroupId: null,
    positionInRowLevelPermissionPredicateGroup: null,
    roleId: 'role-id',
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

  it('should grant each object operation when any role grants it', () => {
    const salesRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        canReadObjectRecords: true,
        canSoftDeleteObjectRecords: true,
      }),
    };
    const automationRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        canUpdateObjectRecords: true,
        canDestroyObjectRecords: true,
      }),
    };

    expect(
      computePermissionUnion([salesRolePermissions, automationRolePermissions])[
        companyObjectMetadataId
      ],
    ).toEqual(
      createObjectPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
      }),
    );
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

  it('should keep field restrictions when all roles with matching object operation restrict the field', () => {
    const salesRolePermissions: ObjectsPermissions = {
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
    const automationRolePermissions: ObjectsPermissions = {
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

    expect(
      computePermissionUnion([salesRolePermissions, automationRolePermissions])[
        companyObjectMetadataId
      ].restrictedFields,
    ).toEqual({
      [annualRecurringRevenueFieldMetadataId]: {
        canRead: false,
        canUpdate: false,
      },
    });
  });

  it('should combine row level permission predicates and groups across roles', () => {
    const salesPredicate = createRowLevelPermissionPredicate({
      id: 'sales-predicate-id',
      roleId: 'sales-role-id',
    });
    const automationPredicate = createRowLevelPermissionPredicate({
      id: 'automation-predicate-id',
      roleId: 'automation-role-id',
    });
    const salesPredicateGroup = createRowLevelPermissionPredicateGroup({
      id: 'sales-predicate-group-id',
      roleId: 'sales-role-id',
    });
    const automationPredicateGroup = createRowLevelPermissionPredicateGroup({
      id: 'automation-predicate-group-id',
      roleId: 'automation-role-id',
    });
    const salesRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        rowLevelPermissionPredicates: [salesPredicate],
        rowLevelPermissionPredicateGroups: [salesPredicateGroup],
      }),
    };
    const automationRolePermissions: ObjectsPermissions = {
      [companyObjectMetadataId]: createObjectPermissions({
        rowLevelPermissionPredicates: [automationPredicate],
        rowLevelPermissionPredicateGroups: [automationPredicateGroup],
      }),
    };

    expect(
      computePermissionUnion([salesRolePermissions, automationRolePermissions])[
        companyObjectMetadataId
      ],
    ).toMatchObject({
      rowLevelPermissionPredicates: [salesPredicate, automationPredicate],
      rowLevelPermissionPredicateGroups: [
        salesPredicateGroup,
        automationPredicateGroup,
      ],
    });
  });
});
