import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceInvitationPreviewStatus } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { WorkspaceInvitationService } from './workspace-invitation.service';

// To fix a circular dependency issue
jest.mock('src/engine/core-modules/workspace/services/workspace.service');

// To avoid dynamic import issues in Jest
jest.mock('@react-email/render', () => ({
  render: jest.fn().mockImplementation(async (template, options) => {
    if (options?.plainText) {
      return 'Plain Text Email';
    }

    return '<html><body>HTML email content</body></html>';
  }),
}));

const createMockInvitationAppToken = (
  overrides: Partial<AppTokenEntity> = {},
): AppTokenEntity =>
  ({
    id: 'app-token-id',
    value: 'valid-token',
    type: AppTokenType.InvitationToken,
    workspaceId: 'workspace-id',
    userId: 'user-id',
    expiresAt: new Date('2030-01-02T03:04:05.000Z'),
    deletedAt: null,
    revokedAt: null,
    context: {
      email: 'new-hire@example.com',
    },
    workspace: {
      id: 'workspace-id',
      displayName: 'Twenty Dev',
    } as WorkspaceEntity,
    user: {
      id: 'user-id',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    } as AppTokenEntity['user'],
    ...overrides,
  }) as AppTokenEntity;

describe('WorkspaceInvitationService', () => {
  let service: WorkspaceInvitationService;
  let appTokenRepository: Repository<AppTokenEntity>;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let twentyConfigService: TwentyConfigService;
  let emailService: EmailService;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: RoleValidationService,
          useValue: {
            validateRoleAssignableToUsersOrThrow: jest.fn(),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingInviteTeamPending: jest.fn(),
            setOnboardingBookOnboardingPending: jest.fn(),
          },
        },
        {
          provide: WorkspaceService,
          useValue: {
            // Mock methods you expect WorkspaceInvitationService to call
            getDefaultWorkspace: jest
              .fn()
              .mockResolvedValue({ id: 'default-workspace-id' }),
            // Add other methods as needed
          },
        },
        {
          provide: I18nService,
          useValue: {
            getI18nInstance: jest.fn().mockReturnValue({
              _: jest.fn().mockReturnValue('mocked-translation'),
            }),
          },
        },
        {
          provide: FileUrlService,
          useValue: {
            signFileByIdUrl: jest
              .fn()
              .mockReturnValue('https://signed-url.com/logo.png'),
          },
        },
        {
          provide: ThrottlerService,
          useValue: {
            tokenBucketThrottleOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    emailService = module.get<EmailService>(EmailService);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkspaceInvitation', () => {
    it('should create a workspace invitation successfully', async () => {
      const email = 'test@example.com';
      const workspace = { id: 'workspace-id' } as WorkspaceEntity;

      jest.spyOn(appTokenRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);

      jest.spyOn(userWorkspaceRepository, 'exists').mockResolvedValue(false);
      jest
        .spyOn(service, 'generateInvitationToken')
        .mockResolvedValue({} as AppTokenEntity);

      await expect(
        service.createWorkspaceInvitation(email, workspace),
      ).resolves.not.toThrow();
    });

    it('should throw an exception if invitation already exists', async () => {
      const email = 'test@example.com';
      const workspace = { id: 'workspace-id' } as WorkspaceEntity;

      jest.spyOn(appTokenRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({}),
      } as any);

      await expect(
        service.createWorkspaceInvitation(email, workspace),
      ).rejects.toThrow(WorkspaceInvitationException);
    });
  });

  describe('getWorkspaceInvitationPreview', () => {
    it('should return a valid invitation preview and trim the token before lookup', async () => {
      const expiresAt = new Date('2030-01-02T03:04:05.000Z');
      const appToken = createMockInvitationAppToken({
        expiresAt,
        context: {
          email: 'new-hire@example.com',
          inviterDisplayName: 'Ada Lovelace',
          inviterEmail: 'ada@example.com',
        },
      });

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      const result =
        await service.getWorkspaceInvitationPreview('  valid-token  ');

      expect(result).toEqual({
        workspaceDisplayName: 'Twenty Dev',
        inviterDisplayName: 'Ada Lovelace',
        inviterEmail: 'ada@example.com',
        invitedEmail: 'new-hire@example.com',
        expiresAt,
        status: WorkspaceInvitationPreviewStatus.VALID,
        isValid: true,
      });
      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          value: 'valid-token',
          type: AppTokenType.InvitationToken,
          deletedAt: expect.any(Object),
        },
        relations: { user: true, workspace: true },
      });
    });

    it('should fall back to the app token user as inviter when context inviter is missing', async () => {
      const appToken = createMockInvitationAppToken();

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      const result = await service.getWorkspaceInvitationPreview('valid-token');

      expect(result).toMatchObject({
        inviterDisplayName: 'Ada Lovelace',
        inviterEmail: 'ada@example.com',
      });
    });

    it('should fall back to the workspace display name when inviter names are missing', async () => {
      const appToken = createMockInvitationAppToken({
        user: {
          id: 'user-id',
          email: 'ada@example.com',
          firstName: '',
          lastName: '',
        } as AppTokenEntity['user'],
      });

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      const result = await service.getWorkspaceInvitationPreview('valid-token');

      expect(result.inviterDisplayName).toBe('Twenty Dev');
    });

    it('should return an expired invitation preview when the token is expired', async () => {
      const expiresAt = new Date('2020-01-02T03:04:05.000Z');
      const appToken = createMockInvitationAppToken({
        expiresAt,
      });

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      const result = await service.getWorkspaceInvitationPreview('valid-token');

      expect(result).toMatchObject({
        expiresAt,
        status: WorkspaceInvitationPreviewStatus.EXPIRED,
        isValid: false,
      });
    });

    it('should throw an invalid invitation exception when the token is blank', async () => {
      const findOneSpy = jest.spyOn(appTokenRepository, 'findOne');

      await expect(
        service.getWorkspaceInvitationPreview('   '),
      ).rejects.toMatchObject({
        code: WorkspaceInvitationExceptionCode.INVALID_INVITATION,
        message: 'Invitation token is missing',
      });
      expect(findOneSpy).not.toHaveBeenCalled();
    });

    it('should throw an invalid invitation exception when no token is found', async () => {
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getWorkspaceInvitationPreview('invalid-token'),
      ).rejects.toMatchObject({
        code: WorkspaceInvitationExceptionCode.INVALID_INVITATION,
        message: 'Invalid invitation token',
      });
    });

    it('should throw a corrupted invitation exception when email context is missing', async () => {
      const appToken = createMockInvitationAppToken({
        context: {},
      });

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      await expect(
        service.getWorkspaceInvitationPreview('valid-token'),
      ).rejects.toMatchObject({
        code: WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED,
        message: 'Invitation corrupted: Missing email in context',
      });
    });

    it('should throw a corrupted invitation exception when workspace relation is missing', async () => {
      const appToken = createMockInvitationAppToken({
        workspace: undefined as unknown as AppTokenEntity['workspace'],
      });

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(appToken);

      await expect(
        service.getWorkspaceInvitationPreview('valid-token'),
      ).rejects.toMatchObject({
        code: WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED,
        message: 'Invitation corrupted: Missing workspace relation',
      });
    });
  });

  describe('generateInvitationToken', () => {
    it('should persist inviter context when provided', async () => {
      const createdAppToken = createMockInvitationAppToken();

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest.spyOn(appTokenRepository, 'create').mockReturnValue(createdAppToken);
      jest.spyOn(appTokenRepository, 'save').mockResolvedValue(createdAppToken);

      const result = await service.generateInvitationToken(
        'workspace-id',
        'new-hire@example.com',
        'role-id',
        {
          displayName: 'Ada Lovelace',
          email: 'ada@example.com',
        },
      );

      expect(appTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-id',
          type: AppTokenType.InvitationToken,
          context: {
            email: 'new-hire@example.com',
            roleId: 'role-id',
            inviterDisplayName: 'Ada Lovelace',
            inviterEmail: 'ada@example.com',
          },
        }),
      );
      expect(appTokenRepository.save).toHaveBeenCalledWith(createdAppToken);
      expect(result).toBe(createdAppToken);
    });
  });

  describe('sendInvitations', () => {
    it('should send invitations successfully', async () => {
      const emails = ['test1@example.com', 'test2@example.com'];
      const workspace = {
        id: 'workspace-id',
        inviteHash: 'invite-hash',
        displayName: 'Test Workspace',
      } as WorkspaceEntity;
      const sender = {
        userEmail: 'sender@example.com',
        name: { firstName: 'Sender', lastName: 'User' },
        locale: 'en',
      };

      jest.spyOn(service, 'createWorkspaceInvitation').mockResolvedValue({
        context: { email: 'test@example.com' },
        value: 'token-value',
        type: AppTokenType.InvitationToken,
      } as AppTokenEntity);
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('http://localhost:3000');
      jest.spyOn(emailService, 'send').mockResolvedValue({} as any);
      jest
        .spyOn(onboardingService, 'setOnboardingInviteTeamPending')
        .mockResolvedValue({} as any);

      const result = await service.sendInvitations(
        emails,
        workspace,
        sender as WorkspaceMemberWorkspaceEntity,
      );

      expect(result.success).toBe(true);
      expect(result.result.length).toBe(2);
      expect(service.createWorkspaceInvitation).toHaveBeenNthCalledWith(
        1,
        emails[0],
        workspace,
        undefined,
        {
          displayName: 'Sender User',
          email: sender.userEmail,
        },
      );
      expect(service.createWorkspaceInvitation).toHaveBeenNthCalledWith(
        2,
        emails[1],
        workspace,
        undefined,
        {
          displayName: 'Sender User',
          email: sender.userEmail,
        },
      );
      expect(emailService.send).toHaveBeenCalledTimes(2);
      expect(
        onboardingService.setOnboardingInviteTeamPending,
      ).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        value: false,
      });
      expect(
        onboardingService.setOnboardingBookOnboardingPending,
      ).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        value: true,
      });
    });
  });
});
