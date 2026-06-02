import { getWorkspaceInvitationPreviewUiState } from '@/workspace-invitation/utils/getWorkspaceInvitationPreviewUiState';

describe('getWorkspaceInvitationPreviewUiState', () => {
  it('should return loading when query is loading', () => {
    expect(
      getWorkspaceInvitationPreviewUiState({
        loading: true,
        preview: null,
        hasQueryError: false,
      }),
    ).toBe('loading');
  });

  it('should return invalid when query errors without preview data', () => {
    expect(
      getWorkspaceInvitationPreviewUiState({
        loading: false,
        preview: null,
        hasQueryError: true,
      }),
    ).toBe('invalid');
  });

  it('should return expired when status indicates expiration', () => {
    expect(
      getWorkspaceInvitationPreviewUiState({
        loading: false,
        preview: {
          isValid: false,
          status: 'EXPIRED',
        },
        hasQueryError: false,
      }),
    ).toBe('expired');
  });

  it('should return valid when invitation is valid and not expired', () => {
    const futureDate = new Date(Date.now() + 60_000).toISOString();

    expect(
      getWorkspaceInvitationPreviewUiState({
        loading: false,
        preview: {
          isValid: true,
          status: 'PENDING',
          expiresAt: futureDate,
        },
        hasQueryError: false,
      }),
    ).toBe('valid');
  });
});
