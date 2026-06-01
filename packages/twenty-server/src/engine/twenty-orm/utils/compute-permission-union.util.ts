import {
  type ObjectPermissions,
  type ObjectsPermissions,
  type RestrictedFieldPermissions,
} from 'twenty-shared/types';

const hasFieldPermission = (
  objectPermissions: ObjectPermissions,
  fieldMetadataId: string,
  fieldPermissionType: keyof RestrictedFieldPermissions,
) => objectPermissions.restrictedFields[fieldMetadataId]?.[fieldPermissionType] !== false;

const computeRestrictedFieldPermissionUnion = ({
  permissionsWithObjectPermission,
  fieldMetadataId,
  fieldPermissionType,
}: {
  permissionsWithObjectPermission: ObjectPermissions[];
  fieldMetadataId: string;
  fieldPermissionType: keyof RestrictedFieldPermissions;
}) =>
  permissionsWithObjectPermission.every(
    (objectPermissions) =>
      !hasFieldPermission(
        objectPermissions,
        fieldMetadataId,
        fieldPermissionType,
      ),
  )
    ? false
    : null;

export const computePermissionUnion = (
  permissionsArray: ObjectsPermissions[],
): ObjectsPermissions => {
  if (permissionsArray.length === 0) {
    return {};
  }

  if (permissionsArray.length === 1) {
    return permissionsArray[0];
  }

  const result: ObjectsPermissions = {};
  const allObjectMetadataIds = new Set<string>();

  for (const permissions of permissionsArray) {
    for (const objectMetadataId of Object.keys(permissions)) {
      allObjectMetadataIds.add(objectMetadataId);
    }
  }

  for (const objectMetadataId of allObjectMetadataIds) {
    const permissionsForObject = permissionsArray
      .map((permissions) => permissions[objectMetadataId])
      .filter((objectPermissions) => objectPermissions !== undefined);

    const permissionsWithReadObjectPermission = permissionsForObject.filter(
      (objectPermissions) => objectPermissions.canReadObjectRecords,
    );
    const permissionsWithUpdateObjectPermission = permissionsForObject.filter(
      (objectPermissions) => objectPermissions.canUpdateObjectRecords,
    );

    const fieldMetadataIds = new Set<string>();

    for (const objectPermissions of permissionsForObject) {
      for (const fieldMetadataId of Object.keys(
        objectPermissions.restrictedFields,
      )) {
        fieldMetadataIds.add(fieldMetadataId);
      }
    }

    const restrictedFields: Record<string, RestrictedFieldPermissions> = {};

    for (const fieldMetadataId of fieldMetadataIds) {
      restrictedFields[fieldMetadataId] = {
        canRead:
          permissionsWithReadObjectPermission.length === 0
            ? false
            : computeRestrictedFieldPermissionUnion({
                permissionsWithObjectPermission:
                  permissionsWithReadObjectPermission,
                fieldMetadataId,
                fieldPermissionType: 'canRead',
              }),
        canUpdate:
          permissionsWithUpdateObjectPermission.length === 0
            ? false
            : computeRestrictedFieldPermissionUnion({
                permissionsWithObjectPermission:
                  permissionsWithUpdateObjectPermission,
                fieldMetadataId,
                fieldPermissionType: 'canUpdate',
              }),
      };
    }

    result[objectMetadataId] = {
      canReadObjectRecords: permissionsForObject.some(
        (objectPermissions) => objectPermissions.canReadObjectRecords,
      ),
      canUpdateObjectRecords: permissionsForObject.some(
        (objectPermissions) => objectPermissions.canUpdateObjectRecords,
      ),
      canSoftDeleteObjectRecords: permissionsForObject.some(
        (objectPermissions) => objectPermissions.canSoftDeleteObjectRecords,
      ),
      canDestroyObjectRecords: permissionsForObject.some(
        (objectPermissions) => objectPermissions.canDestroyObjectRecords,
      ),
      restrictedFields,
      rowLevelPermissionPredicates: permissionsForObject.flatMap(
        (objectPermissions) => objectPermissions.rowLevelPermissionPredicates,
      ),
      rowLevelPermissionPredicateGroups: permissionsForObject.flatMap(
        (objectPermissions) =>
          objectPermissions.rowLevelPermissionPredicateGroups,
      ),
    };
  }

  return result;
};
