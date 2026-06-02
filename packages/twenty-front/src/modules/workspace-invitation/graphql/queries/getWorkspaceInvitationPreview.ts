import { gql } from '@apollo/client';

export const GET_WORKSPACE_INVITATION_PREVIEW = gql`
  query GetWorkspaceInvitationPreview($invitationToken: String!) {
    workspaceInvitationPreview(invitationToken: $invitationToken) {
      workspaceDisplayName
      inviterDisplayName
      inviterEmail
      invitedEmail
      expiresAt
      status
      isValid
    }
  }
`;
