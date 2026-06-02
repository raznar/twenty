import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export enum WorkspaceInvitationPreviewStatus {
  EXPIRED = 'EXPIRED',
  VALID = 'VALID',
}

registerEnumType(WorkspaceInvitationPreviewStatus, {
  name: 'WorkspaceInvitationPreviewStatus',
});

@ObjectType('WorkspaceInvitation')
export class WorkspaceInvitation {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  email: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string | null;

  @Field({ nullable: false })
  expiresAt: Date;
}

@ObjectType('WorkspaceInvitationPreview')
export class WorkspaceInvitationPreview {
  @Field({ nullable: false })
  workspaceDisplayName: string;

  @Field({ nullable: true })
  inviterDisplayName: string | null;

  @Field({ nullable: true })
  inviterEmail: string | null;

  @Field({ nullable: false })
  invitedEmail: string;

  @Field({ nullable: false })
  expiresAt: Date;

  @Field(() => WorkspaceInvitationPreviewStatus, { nullable: false })
  status: WorkspaceInvitationPreviewStatus;

  @Field({ nullable: false })
  isValid: boolean;
}
