import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { WorkspaceInvitationPreviewCard } from '@/auth/sign-in-up/components/WorkspaceInvitationPreviewCard';
import { type WorkspaceInvitationPreview } from '@/workspace-invitation/types/workspace-invitation-preview.types';
import { type WorkspaceInvitationPreviewUiState } from '@/workspace-invitation/utils/get-workspace-invitation-preview-ui-state';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const createInvitationPreview = ({
  isValid = true,
  status = 'VALID',
}: {
  isValid?: boolean;
  status?: string;
} = {}): WorkspaceInvitationPreview => ({
  workspaceDisplayName: 'Twenty Dev',
  inviterDisplayName: 'Ada Lovelace',
  inviterEmail: 'ada@example.com',
  invitedEmail: 'new-hire@example.com',
  expiresAt: '2030-01-02T03:04:05.000Z',
  status,
  isValid,
});

const renderInvitationPreviewCard = ({
  preview,
  uiState,
}: {
  preview?: WorkspaceInvitationPreview | null;
  uiState: WorkspaceInvitationPreviewUiState;
}) => {
  return render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <MemoryRouter>
          <WorkspaceInvitationPreviewCard preview={preview} uiState={uiState} />
        </MemoryRouter>
      </ThemeProvider>
    </I18nProvider>,
  );
};

describe('WorkspaceInvitationPreviewCard', () => {
  beforeAll(async () => {
    await dynamicActivate(SOURCE_LOCALE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state while invitation preview is loading', () => {
    renderInvitationPreviewCard({
      uiState: 'loading',
    });

    expect(screen.getByText(/Loading invitation details/i)).toBeInTheDocument();
  });

  it('should display valid invite details when invitation token is valid', () => {
    renderInvitationPreviewCard({
      preview: createInvitationPreview(),
      uiState: 'valid',
    });

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getAllByText('Twenty Dev').length).toBeGreaterThan(0);
    expect(screen.getByText('Invited by')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Invited email')).toBeInTheDocument();
    expect(screen.getByText('new-hire@example.com')).toBeInTheDocument();
    expect(screen.getByText('Expires')).toBeInTheDocument();
  });

  it('should display expired invite messaging when invitation token is expired', () => {
    renderInvitationPreviewCard({
      preview: createInvitationPreview({
        isValid: false,
        status: 'EXPIRED',
      }),
      uiState: 'expired',
    });

    expect(screen.getByText(/Invitation expired/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ask your workspace admin to send a new invite/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Back to home')).toBeInTheDocument();
  });

  it('should display invalid invite messaging when invitation token is invalid', () => {
    renderInvitationPreviewCard({
      uiState: 'invalid',
    });

    expect(screen.getByText(/Invalid invitation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The link may be incorrect or has already been used/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Back to home')).toBeInTheDocument();
  });
});
