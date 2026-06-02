import { SubTitle } from '@/auth/components/SubTitle';
import { type WorkspaceInvitationPreview } from '@/workspace-invitation/types/workspace-invitation-preview.types';
import { type WorkspaceInvitationPreviewUiState } from '@/workspace-invitation/utils/get-workspace-invitation-preview-ui-state';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Callout, IconClock, IconMail, IconUser } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[6]};
  max-width: 100%;
  width: 100%;
`;

const StyledPreviewCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
  text-align: left;
  width: 100%;
`;

const StyledPreviewRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPreviewLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledPreviewValue = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]} 0;
  width: 100%;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const formatInvitationExpiresAt = (expiresAt?: string | null): string => {
  if (!isDefined(expiresAt) || expiresAt === '') {
    return '';
  }

  const expiresAtDate = new Date(expiresAt);

  if (Number.isNaN(expiresAtDate.getTime())) {
    return '';
  }

  return expiresAtDate.toLocaleString();
};

type WorkspaceInvitationPreviewCardProps = {
  preview?: WorkspaceInvitationPreview | null;
  uiState: WorkspaceInvitationPreviewUiState;
};

export const WorkspaceInvitationPreviewCard = ({
  preview,
  uiState,
}: WorkspaceInvitationPreviewCardProps) => {
  const { t } = useLingui();
  const navigate = useNavigateApp();

  if (uiState === 'loading') {
    return (
      <StyledPreviewContainer>
        <StyledLoaderContainer>
          <Loader color="gray" />
        </StyledLoaderContainer>
        <SubTitle>
          <Trans>Loading invitation details...</Trans>
        </SubTitle>
      </StyledPreviewContainer>
    );
  }

  if (uiState === 'expired') {
    return (
      <StyledPreviewContainer>
        <Callout
          variant="warning"
          Icon={IconClock}
          title={t`Invitation expired`}
          description={t`This workspace invitation is no longer valid. Ask your workspace admin to send a new invite.`}
        />
        <StyledActionsContainer>
          <ClickToActionLink onClick={() => navigate(AppPath.Index)}>
            <Trans>Back to home</Trans>
          </ClickToActionLink>
        </StyledActionsContainer>
      </StyledPreviewContainer>
    );
  }

  if (uiState === 'invalid') {
    return (
      <StyledPreviewContainer>
        <Callout
          variant="error"
          title={t`Invalid invitation`}
          description={t`We could not find this invitation. The link may be incorrect or has already been used.`}
        />
        <StyledActionsContainer>
          <ClickToActionLink onClick={() => navigate(AppPath.Index)}>
            <Trans>Back to home</Trans>
          </ClickToActionLink>
        </StyledActionsContainer>
      </StyledPreviewContainer>
    );
  }

  const workspaceName =
    preview?.workspaceDisplayName?.trim() || t`this workspace`;
  const inviterName =
    preview?.inviterDisplayName?.trim() ||
    preview?.inviterEmail?.trim() ||
    t`A team member`;
  const invitedEmail = preview?.invitedEmail?.trim();
  const formattedExpiresAt = formatInvitationExpiresAt(preview?.expiresAt);

  return (
    <StyledPreviewContainer>
      <SubTitle>
        <Trans>
          You have been invited to join {workspaceName}. Sign in below to
          accept.
        </Trans>
      </SubTitle>
      <StyledPreviewCard>
        <StyledPreviewRow>
          <StyledPreviewLabel>
            <Trans>Workspace</Trans>
          </StyledPreviewLabel>
          <StyledPreviewValue>{workspaceName}</StyledPreviewValue>
        </StyledPreviewRow>
        <StyledPreviewRow>
          <StyledPreviewLabel>
            <Trans>Invited by</Trans>
          </StyledPreviewLabel>
          <StyledPreviewValue>
            <IconUser size={14} />
            {inviterName}
          </StyledPreviewValue>
        </StyledPreviewRow>
        {isDefined(invitedEmail) && invitedEmail !== '' && (
          <StyledPreviewRow>
            <StyledPreviewLabel>
              <Trans>Invited email</Trans>
            </StyledPreviewLabel>
            <StyledPreviewValue>
              <IconMail size={14} />
              {invitedEmail}
            </StyledPreviewValue>
          </StyledPreviewRow>
        )}
        {formattedExpiresAt !== '' && (
          <StyledPreviewRow>
            <StyledPreviewLabel>
              <Trans>Expires</Trans>
            </StyledPreviewLabel>
            <StyledPreviewValue>
              <IconClock size={14} />
              {formattedExpiresAt}
            </StyledPreviewValue>
          </StyledPreviewRow>
        )}
      </StyledPreviewCard>
    </StyledPreviewContainer>
  );
};
