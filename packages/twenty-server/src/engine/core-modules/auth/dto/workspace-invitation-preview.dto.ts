import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WorkspaceInvitationPreview')
export class WorkspaceInvitationPreviewDTO {
  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceDisplayName?: string | null;

  @Field(() => String, { nullable: true })
  workspaceLogo?: string | null;

  @Field(() => Boolean)
  allowImpersonation: boolean;

  @Field(() => String, { nullable: true })
  invitationEmail?: string | null;

  @Field(() => String, { nullable: true })
  inviterEmail?: string | null;

  @Field(() => String, { nullable: true })
  inviterName?: string | null;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date | null;

  @Field(() => Boolean)
  isExpired: boolean;

  @Field(() => Boolean)
  isValid: boolean;
}
