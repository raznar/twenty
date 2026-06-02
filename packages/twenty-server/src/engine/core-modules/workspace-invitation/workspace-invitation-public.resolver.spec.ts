import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';

import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { WorkspaceInvitationPublicResolver } from './workspace-invitation-public.resolver';

type WorkspaceInvitationPreview = {
  workspaceDisplayName: string;
  inviterDisplayName: string | null;
  inviterEmail: string | null;
  invitedEmail: string;
  expiresAt: Date;
  status: 'VALID';
  isValid: boolean;
};

const createWorkspaceInvitationServiceMock = () => ({
  getWorkspaceInvitationPreview: jest.fn(),
});

describe('WorkspaceInvitationPublicResolver', () => {
  let resolver: WorkspaceInvitationPublicResolver;
  let workspaceInvitationService: ReturnType<
    typeof createWorkspaceInvitationServiceMock
  >;

  beforeEach(() => {
    workspaceInvitationService = createWorkspaceInvitationServiceMock();
    resolver = new WorkspaceInvitationPublicResolver(
      workspaceInvitationService as unknown as WorkspaceInvitationService,
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
      status: 'VALID',
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
