export type WorkspaceInvitationPreview = {
  workspaceDisplayName?: string | null;
  inviterDisplayName?: string | null;
  inviterEmail?: string | null;
  invitedEmail?: string | null;
  expiresAt?: string | null;
  status?: string | null;
  isValid: boolean;
};

export type GetWorkspaceInvitationPreviewQuery = {
  workspaceInvitationPreview: WorkspaceInvitationPreview;
};

export type GetWorkspaceInvitationPreviewQueryVariables = {
  invitationToken: string;
};
