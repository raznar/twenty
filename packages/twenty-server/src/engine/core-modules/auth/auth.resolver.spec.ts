import { type CanActivate } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type WorkspaceInvitationPreviewDTO } from 'src/engine/core-modules/auth/dto/workspace-invitation-preview.dto';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './services/auth.service';
import { ResetPasswordService } from './services/reset-password.service';
import { EmailVerificationTokenService } from './token/services/email-verification-token.service';
import { LoginTokenService } from './token/services/login-token.service';
import { RenewTokenService } from './token/services/renew-token.service';
import { TransientTokenService } from './token/services/transient-token.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<
    Pick<AuthService, 'getWorkspaceInvitationPreview'>
  >;
  const mock_CaptchaGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {
            getWorkspaceInvitationPreview: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
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
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: RenewTokenService,
          useValue: {},
        },
        {
          provide: SignInUpService,
          useValue: {},
        },
        {
          provide: ApiKeyService,
          useValue: {},
        },
        {
          provide: ResetPasswordService,
          useValue: {},
        },
        {
          provide: LoginTokenService,
          useValue: {},
        },
        {
          provide: WorkspaceAgnosticTokenService,
          useValue: {},
        },
        {
          provide: TransientTokenService,
          useValue: {},
        },
        {
          provide: EmailVerificationService,
          useValue: {},
        },
        {
          provide: EmailVerificationTokenService,
          useValue: {},
        },
        {
          provide: PermissionsService,
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useValue: {},
        },
        {
          provide: SSOService,
          useValue: {},
        },
        {
          provide: TwoFactorAuthenticationService,
          useValue: {},
        },
        {
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: AuditService,
          useValue: {
            createContext: jest.fn().mockReturnValue({
              insertWorkspaceEvent: jest.fn(),
            }),
          },
        },
      ],
    })
      .overrideGuard(CaptchaGuard)
      .useValue(mock_CaptchaGuard)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get(AuthService) as jest.Mocked<
      Pick<AuthService, 'getWorkspaceInvitationPreview'>
    >;
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getWorkspaceInvitationPreview', () => {
    const workspaceInvitationPreview = {
      workspaceId: 'workspace-id',
      workspaceDisplayName: 'Test Workspace',
      workspaceLogo: 'https://example.com/logo.png',
      allowImpersonation: false,
      invitationEmail: 'invited@example.com',
      inviterEmail: 'sender@example.com',
      inviterName: 'Sender Name',
      expiresAt: new Date('2100-01-01T00:00:00.000Z'),
      isExpired: false,
      isValid: true,
    } satisfies WorkspaceInvitationPreviewDTO;

    it('should delegate invitation preview lookup to AuthService', async () => {
      authService.getWorkspaceInvitationPreview.mockResolvedValue(
        workspaceInvitationPreview,
      );

      const result = await resolver.getWorkspaceInvitationPreview(
        'invite-hash',
        'invite-token',
      );

      expect(result).toEqual(workspaceInvitationPreview);
      expect(authService.getWorkspaceInvitationPreview).toHaveBeenCalledWith({
        inviteHash: 'invite-hash',
        inviteToken: 'invite-token',
      });
    });

    it('should pass an undefined invite token for public invite previews', async () => {
      authService.getWorkspaceInvitationPreview.mockResolvedValue({
        ...workspaceInvitationPreview,
        invitationEmail: null,
        inviterEmail: null,
        inviterName: null,
        expiresAt: null,
      });

      await resolver.getWorkspaceInvitationPreview('invite-hash');

      expect(authService.getWorkspaceInvitationPreview).toHaveBeenCalledWith({
        inviteHash: 'invite-hash',
        inviteToken: undefined,
      });
    });

    it('should propagate invitation preview errors from AuthService', async () => {
      const error = new AuthException(
        'Workspace does not exist',
        AuthExceptionCode.INVALID_INPUT,
      );

      authService.getWorkspaceInvitationPreview.mockRejectedValue(error);

      await expect(
        resolver.getWorkspaceInvitationPreview('missing-invite-hash'),
      ).rejects.toThrow(error);
    });

    it('should be exposed through public no-permission guards', () => {
      expect(
        Reflect.getMetadata(
          GUARDS_METADATA,
          AuthResolver.prototype.getWorkspaceInvitationPreview,
        ),
      ).toEqual([PublicEndpointGuard, NoPermissionGuard]);
    });
  });
});
