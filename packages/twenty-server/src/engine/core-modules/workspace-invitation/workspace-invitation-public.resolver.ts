import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceInvitationPreview } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import { WorkspaceInvitationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workspace-invitation/filters/workspace-invitation-graphql-api-exception.filter';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkspaceInvitationGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@MetadataResolver()
export class WorkspaceInvitationPublicResolver {
  constructor(
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Query(() => WorkspaceInvitationPreview)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async workspaceInvitationPreview(
    @Args('invitationToken') invitationToken: string,
  ): Promise<WorkspaceInvitationPreview> {
    return await this.workspaceInvitationService.getWorkspaceInvitationPreview(
      invitationToken,
    );
  }
}
