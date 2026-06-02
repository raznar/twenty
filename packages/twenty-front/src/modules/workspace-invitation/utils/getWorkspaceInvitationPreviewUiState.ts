import { type WorkspaceInvitationPreview } from '@/workspace-invitation/types/workspace-invitation-preview.types';
import { isDefined } from 'twenty-shared/utils';

export type WorkspaceInvitationPreviewUiState =
  | 'loading'
  | 'valid'
  | 'expired'
  | 'invalid';

const isInvitationExpiredByDate = (expiresAt?: string | null): boolean => {
  if (!isDefined(expiresAt) || expiresAt === '') {
    return false;
  }

  const expiresAtDate = new Date(expiresAt);

  return !Number.isNaN(expiresAtDate.getTime()) && expiresAtDate < new Date();
};

const isInvitationExpiredByStatus = (status?: string | null): boolean => {
  if (!isDefined(status)) {
    return false;
  }

  return status.toUpperCase().includes('EXPIRED');
};

export const getWorkspaceInvitationPreviewUiState = ({
  loading,
  preview,
  hasQueryError,
}: {
  loading: boolean;
  preview?: WorkspaceInvitationPreview | null;
  hasQueryError: boolean;
}): WorkspaceInvitationPreviewUiState => {
  if (loading) {
    return 'loading';
  }

  if (hasQueryError || !isDefined(preview)) {
    return 'invalid';
  }

  if (
    isInvitationExpiredByStatus(preview.status) ||
    isInvitationExpiredByDate(preview.expiresAt)
  ) {
    return 'expired';
  }

  if (!preview.isValid) {
    return 'invalid';
  }

  return 'valid';
};
