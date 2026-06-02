import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type WorkspaceInvitationPreview } from '@/workspace/graphql/queries/getWorkspaceFromInviteHash';

type WorkspaceInvitationPreviewCardProps = {
  invitationPreview: WorkspaceInvitationPreview;
};

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledStatusBadge = styled.div<{ isValid: boolean }>`
  background-color: ${({ isValid }) =>
    isValid ? themeCssVariables.color.green10 : themeCssVariables.color.red10};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isValid }) =>
    isValid ? themeCssVariables.color.green : themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledDetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDetailLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledDetailValue = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledInvalidMessage = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceInvitationPreviewCard = ({
  invitationPreview,
}: WorkspaceInvitationPreviewCardProps) => {
  const { t } = useLingui();

  const formattedExpiration = useMemo(() => {
    if (!isDefined(invitationPreview.expiresAt)) {
      return t`No expiration`;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(invitationPreview.expiresAt));
  }, [invitationPreview.expiresAt, t]);

  const inviter = useMemo(() => {
    if (
      isDefined(invitationPreview.inviterName) &&
      isDefined(invitationPreview.inviterEmail)
    ) {
      return `${invitationPreview.inviterName} (${invitationPreview.inviterEmail})`;
    }

    return (
      invitationPreview.inviterName ??
      invitationPreview.inviterEmail ??
      t`Not available`
    );
  }, [invitationPreview.inviterEmail, invitationPreview.inviterName, t]);

  const status = invitationPreview.isValid
    ? t`Valid`
    : invitationPreview.isExpired
      ? t`Expired`
      : t`Invalid`;

  return (
    <StyledCard>
      <StyledHeader>
        <StyledTitle>{t`Invitation details`}</StyledTitle>
        <StyledStatusBadge isValid={invitationPreview.isValid}>
          {status}
        </StyledStatusBadge>
      </StyledHeader>
      <StyledDetailRow>
        <StyledDetailLabel>{t`Workspace`}</StyledDetailLabel>
        <StyledDetailValue>
          {invitationPreview.workspaceDisplayName ??
            invitationPreview.workspaceId}
        </StyledDetailValue>
      </StyledDetailRow>
      <StyledDetailRow>
        <StyledDetailLabel>{t`Invitation email`}</StyledDetailLabel>
        <StyledDetailValue>
          {invitationPreview.invitationEmail ?? t`Anyone with this invite link`}
        </StyledDetailValue>
      </StyledDetailRow>
      <StyledDetailRow>
        <StyledDetailLabel>{t`Invited by`}</StyledDetailLabel>
        <StyledDetailValue>{inviter}</StyledDetailValue>
      </StyledDetailRow>
      <StyledDetailRow>
        <StyledDetailLabel>{t`Expiration`}</StyledDetailLabel>
        <StyledDetailValue>{formattedExpiration}</StyledDetailValue>
      </StyledDetailRow>
      {!invitationPreview.isValid && (
        <StyledInvalidMessage>
          {t`This invitation can no longer be accepted.`}
        </StyledInvalidMessage>
      )}
    </StyledCard>
  );
};
