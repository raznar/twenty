import { Test, type TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';

import {
  WorkspaceInvitationPreview,
  WorkspaceInvitationPreviewStatus,
} from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { WorkspaceInvitationPublicResolver } from './workspace-invitation-public.resolver';

type WorkspaceInvitationServiceMock = {
  getWorkspaceInvitationPreview: jest.MockedFunction<
    WorkspaceInvitationService['getWorkspaceInvitationPreview']
  >;
};

const createWorkspaceInvitationServiceMock =
  (): WorkspaceInvitationServiceMock => ({
    getWorkspaceInvitationPreview: jest.fn(),
  });

describe('WorkspaceInvitationPublicResolver', () => {
  let resolver: WorkspaceInvitationPublicResolver;
  let workspaceInvitationService: WorkspaceInvitationServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationPublicResolver,
        {
          provide: WorkspaceInvitationService,
          useFactory: createWorkspaceInvitationServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<WorkspaceInvitationPublicResolver>(
      WorkspaceInvitationPublicResolver,
    );
    workspaceInvitationService = module.get<WorkspaceInvitationServiceMock>(
      WorkspaceInvitationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return invitation preview from the workspace invitation service', async () => {
    const expiresAt = new Date('2030-01-02T03:04:05.000Z');
    const invitationPreview = {
      workspaceDisplayName: 'Twenty Dev',
      inviterDisplayName: 'Ada Lovelace',
      inviterEmail: 'ada@example.com',
      invitedEmail: 'new-hire@example.com',
      expiresAt,
      status: WorkspaceInvitationPreviewStatus.VALID,
      isValid: true,
    } satisfies WorkspaceInvitationPreview;

    workspaceInvitationService.getWorkspaceInvitationPreview.mockResolvedValue(
      invitationPreview,
    );

    await expect(
      resolver.workspaceInvitationPreview('valid-token'),
    ).resolves.toEqual(invitationPreview);
    expect(
      workspaceInvitationService.getWorkspaceInvitationPreview,
    ).toHaveBeenCalledWith('valid-token');
  });

  it('should expose the preview query as a public endpoint with no permission requirements', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      WorkspaceInvitationPublicResolver.prototype.workspaceInvitationPreview,
    );

    expect(guards).toEqual([PublicEndpointGuard, NoPermissionGuard]);
  });

  it('should surface workspace invitation errors when token preview fails', async () => {
    const exception = new WorkspaceInvitationException(
      'Invalid invitation token',
      WorkspaceInvitationExceptionCode.INVALID_INVITATION,
    );

    workspaceInvitationService.getWorkspaceInvitationPreview.mockRejectedValue(
      exception,
    );

    await expect(
      resolver.workspaceInvitationPreview('invalid-token'),
    ).rejects.toThrow(exception);
  });
});
