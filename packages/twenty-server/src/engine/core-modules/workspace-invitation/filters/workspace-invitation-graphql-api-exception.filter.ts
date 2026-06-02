import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { workspaceInvitationGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace-invitation/utils/workspace-invitation-graphql-api-exception-handler.util';
import { WorkspaceInvitationException } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';

@Catch(WorkspaceInvitationException)
export class WorkspaceInvitationGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WorkspaceInvitationException, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      throw exception;
    }

    return workspaceInvitationGraphqlApiExceptionHandler(exception);
  }
}
