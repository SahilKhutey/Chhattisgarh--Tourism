/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateDashboard } from '../TemplateDashboard';
import * as hooks from '../useAdminTemplates';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../useAdminTemplates', () => ({
  useAdminTemplates: jest.fn(),
}));

describe('TemplateDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when data is loading', () => {
    (hooks.useAdminTemplates as jest.Mock).mockReturnValue({
      data: {
        items: [],
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        draft_count: 0,
        published_count: 0,
        archived_count: 0,
      },
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TemplateDashboard />);
    expect(screen.getByText('Content Templates')).toBeInTheDocument();
  });

  it('renders error message and retry button on error', () => {
    const mockRefetch = jest.fn();
    (hooks.useAdminTemplates as jest.Mock).mockReturnValue({
      data: {
        items: [],
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        draft_count: 0,
        published_count: 0,
        archived_count: 0,
      },
      isLoading: false,
      isError: true,
      error: new Error('Backend connection refused'),
      refetch: mockRefetch,
    });

    render(<TemplateDashboard />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Backend connection refused')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders empty state when no templates exist', () => {
    (hooks.useAdminTemplates as jest.Mock).mockReturnValue({
      data: {
        items: [],
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        draft_count: 0,
        published_count: 0,
        archived_count: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TemplateDashboard />);
    expect(screen.getByText('No templates yet')).toBeInTheDocument();
  });

  it('renders templates table and statistics when data is present', () => {
    (hooks.useAdminTemplates as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            id: 'tpl-1',
            name: 'Temple Circuit',
            slug: 'temple-circuit',
            category: 'heritage',
            status: 'PUBLISHED',
            field_count: 5,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
        total_pages: 1,
        draft_count: 0,
        published_count: 1,
        archived_count: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TemplateDashboard />);
    expect(screen.getByText('Temple Circuit')).toBeInTheDocument();
    expect(screen.getByText('temple-circuit')).toBeInTheDocument();
    expect(screen.getByText('heritage')).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText('Published')).toBeInTheDocument();
  });
});
