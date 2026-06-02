import { GET_WORKSPACE_INVITATION_PREVIEW } from '@/workspace-invitation/graphql/queries/getWorkspaceInvitationPreview';
import {
  type GetWorkspaceInvitationPreviewQuery,
  type GetWorkspaceInvitationPreviewQueryVariables,
} from '@/workspace-invitation/types/workspace-invitation-preview.types';
import { getWorkspaceInvitationPreviewUiState } from '@/workspace-invitation/utils/getWorkspaceInvitationPreviewUiState';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

export const useWorkspaceInvitationPreview = (invitationToken?: string) => {
  const { data, loading, error } = useQuery<
    GetWorkspaceInvitationPreviewQuery,
    GetWorkspaceInvitationPreviewQueryVariables
  >(GET_WORKSPACE_INVITATION_PREVIEW, {
    skip: !isDefined(invitationToken),
    variables: { invitationToken: invitationToken ?? '' },
    errorPolicy: 'all',
  });

  const preview = data?.workspaceInvitationPreview;
  const uiState = getWorkspaceInvitationPreviewUiState({
    loading,
    preview,
    hasQueryError: isDefined(error) && !isDefined(preview),
  });

  return {
    preview,
    uiState,
    loading,
    error,
  };
};
