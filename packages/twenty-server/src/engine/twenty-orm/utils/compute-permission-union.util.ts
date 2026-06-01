import {
  type ObjectPermissions,
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';

const computeRestrictedFieldPermissionUnion = (
  objectPermissions: ObjectPermissions[],
): RestrictedFieldsPermissions => {
  const restrictedFields: RestrictedFieldsPermissions = {};
  const fieldMetadataIds = new Set<string>();

  for (const objectPermission of objectPermissions) {
    for (const fieldMetadataId of Object.keys(
      objectPermission.restrictedFields,
    )) {
      fieldMetadataIds.add(fieldMetadataId);
    }
  }

  for (const fieldMetadataId of fieldMetadataIds) {
    const readableObjectPermissions = objectPermissions.filter(
      (objectPermission) => objectPermission.canReadObjectRecords === true,
    );
    const updatableObjectPermissions = objectPermissions.filter(
      (objectPermission) => objectPermission.canUpdateObjectRecords === true,
    );

    const canReadIsRestricted =
      readableObjectPermissions.length > 0 &&
      readableObjectPermissions.every(
        (objectPermission) =>
          objectPermission.restrictedFields[fieldMetadataId]?.canRead === false,
      );

    const canUpdateIsRestricted =
      updatableObjectPermissions.length > 0 &&
      updatableObjectPermissions.every(
        (objectPermission) =>
          objectPermission.restrictedFields[fieldMetadataId]?.canUpdate ===
          false,
      );

    if (canReadIsRestricted || canUpdateIsRestricted) {
      restrictedFields[fieldMetadataId] = {
        ...(canReadIsRestricted ? { canRead: false } : {}),
        ...(canUpdateIsRestricted ? { canUpdate: false } : {}),
      };
    }
  }

  return restrictedFields;
};

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
    const objectPermissions = permissionsArray
      .map((permissions) => permissions[objectMetadataId])
      .filter((objectPermission) => objectPermission !== undefined);

    result[objectMetadataId] = {
      canReadObjectRecords: objectPermissions.some(
        (objectPermission) => objectPermission.canReadObjectRecords === true,
      ),
      canUpdateObjectRecords: objectPermissions.some(
        (objectPermission) => objectPermission.canUpdateObjectRecords === true,
      ),
      canSoftDeleteObjectRecords: objectPermissions.some(
        (objectPermission) =>
          objectPermission.canSoftDeleteObjectRecords === true,
      ),
      canDestroyObjectRecords: objectPermissions.some(
        (objectPermission) => objectPermission.canDestroyObjectRecords === true,
      ),
      restrictedFields:
        computeRestrictedFieldPermissionUnion(objectPermissions),
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    };
  }

  return result;
};
