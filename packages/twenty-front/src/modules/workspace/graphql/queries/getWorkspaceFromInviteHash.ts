import { gql } from '@apollo/client';

export const GET_WORKSPACE_FROM_INVITE_HASH = gql`
  query GetWorkspaceFromInviteHash($inviteHash: String!) {
    findWorkspaceFromInviteHash(inviteHash: $inviteHash) {
      id
      displayName
      logo
      allowImpersonation
    }
  }
`;

export type WorkspaceInvitationPreview = {
  __typename?: 'WorkspaceInvitationPreview';
  workspaceId: string;
  workspaceDisplayName?: string | null;
  workspaceLogo?: string | null;
  allowImpersonation: boolean;
  invitationEmail?: string | null;
  inviterEmail?: string | null;
  inviterName?: string | null;
  expiresAt?: string | null;
  isExpired: boolean;
  isValid: boolean;
};

export type GetWorkspaceInvitationPreviewQuery = {
  __typename?: 'Query';
  getWorkspaceInvitationPreview: WorkspaceInvitationPreview;
};

export type GetWorkspaceInvitationPreviewQueryVariables = {
  inviteHash: string;
  inviteToken?: string;
};

export const GET_WORKSPACE_INVITATION_PREVIEW = gql`
  query GetWorkspaceInvitationPreview(
    $inviteHash: String!
    $inviteToken: String
  ) {
    getWorkspaceInvitationPreview(
      inviteHash: $inviteHash
      inviteToken: $inviteToken
    ) {
      workspaceId
      workspaceDisplayName
      workspaceLogo
      allowImpersonation
      invitationEmail
      inviterEmail
      inviterName
      expiresAt
      isExpired
      isValid
    }
  }
`;
