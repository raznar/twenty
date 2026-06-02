import { assertUnreachable } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';

export const workspaceInvitationGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WorkspaceInvitationException) {
    switch (error.code) {
      case WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE:
      case WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED:
      case WorkspaceInvitationExceptionCode.INVALID_INVITATION:
      case WorkspaceInvitationExceptionCode.INVITATION_EXPIRED:
      case WorkspaceInvitationExceptionCode.INVITATION_ALREADY_EXIST:
      case WorkspaceInvitationExceptionCode.USER_ALREADY_EXIST:
      case WorkspaceInvitationExceptionCode.EMAIL_MISSING:
        throw new UserInputError(error);
      default: {
        assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
