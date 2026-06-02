import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  GET_WORKSPACE_INVITATION_PREVIEW,
  type GetWorkspaceInvitationPreviewQuery,
  type GetWorkspaceInvitationPreviewQueryVariables,
} from '@/workspace/graphql/queries/getWorkspaceFromInviteHash';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useQuery } from '@apollo/client/react';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [initiallyLoggedIn] = useState(isDefined(currentWorkspace));
  const [hasRedirected, setHasRedirected] = useState(false);

  const {
    data: workspaceInvitationPreviewData,
    loading,
    error,
  } = useQuery<
    GetWorkspaceInvitationPreviewQuery,
    GetWorkspaceInvitationPreviewQueryVariables
  >(GET_WORKSPACE_INVITATION_PREVIEW, {
    skip: !workspaceInviteHash,
    variables: {
      inviteHash: workspaceInviteHash || '',
      inviteToken: workspacePersonalInviteToken,
    },
  });

  useEffect(() => {
    if (error) {
      enqueueErrorSnackBar({ apolloError: error });
      navigate(AppPath.Index);
    }
  }, [error, enqueueErrorSnackBar, navigate]);

  // TODO: Rework this useEffect - Charles will refactor as part of auth rework
  useEffect(() => {
    if (!workspaceInvitationPreviewData || hasRedirected) return;

    const inviteWorkspace =
      workspaceInvitationPreviewData.getWorkspaceInvitationPreview;

    if (
      isDefined(currentWorkspace) &&
      isDefined(inviteWorkspace) &&
      currentWorkspace.id === inviteWorkspace.workspaceId
    ) {
      setHasRedirected(true);
      const workspaceDisplayName = inviteWorkspace.workspaceDisplayName;
      initiallyLoggedIn &&
        enqueueInfoSnackBar({
          message: workspaceDisplayName
            ? t`You already belong to the workspace ${workspaceDisplayName}`
            : t`You already belong to this workspace`,
        });
      navigate(AppPath.Index);
    }
  }, [
    workspaceInvitationPreviewData,
    currentWorkspace,
    hasRedirected,
    initiallyLoggedIn,
    enqueueInfoSnackBar,
    navigate,
  ]);

  const workspaceInvitationPreview =
    workspaceInvitationPreviewData?.getWorkspaceInvitationPreview;

  return {
    workspace: isDefined(workspaceInvitationPreview)
      ? {
          id: workspaceInvitationPreview.workspaceId,
          displayName: workspaceInvitationPreview.workspaceDisplayName,
          logo: workspaceInvitationPreview.workspaceLogo,
          allowImpersonation: workspaceInvitationPreview.allowImpersonation,
        }
      : undefined,
    workspaceInvitationPreview,
    workspaceInviteHash,
    loading,
  };
};
