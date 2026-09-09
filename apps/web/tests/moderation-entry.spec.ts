/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminModerationPage from '../src/app/admin/entries/page';
import { fetchEntries, reviewEntry } from '../src/lib/content/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock content api module
jest.mock('../src/lib/content/api', () => ({
  fetchEntries: jest.fn(),
  reviewEntry: jest.fn(),
}));

describe('Admin Moderation & Quality Governance Test Suite', () => {
  const mockPendingEntries: any[] = [
    {
      id: 'entry-bastar-dance',
      templateId: 'tpl-folklore',
      title: 'Gardi Dance of Muria Tribe',
      slug: 'gardi-dance-muria-tribe',
      status: 'PENDING_REVIEW',
      authorId: 'author-101',
      version: 1,
      createdAt: '2026-09-09T00:00:00.000Z',
      updatedAt: '2026-09-09T00:00:00.000Z',
      template: {
        id: 'tpl-folklore',
        name: 'Tribal Folklore',
        slug: 'folklore',
        fields: [
          { key: 'title', label: 'Story Title', type: 'TEXT', order: 0 },
          { key: 'tribe', label: 'Tribe', type: 'TEXT', order: 1 },
          { key: 'summary', label: 'Summary', type: 'RICHTEXT', order: 2 },
        ],
      },
      data: {
        title: 'Gardi Dance of Muria Tribe',
        tribe: 'Muria',
        summary: 'A ceremonial post-harvest festive dance in Narayanpur.',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders moderation queue and displays pending submissions', async () => {
    (fetchEntries as jest.Mock).mockResolvedValue(mockPendingEntries);

    render(React.createElement(AdminModerationPage));

    expect(screen.getByText('Content Moderation Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Review Queue & Quality Governance')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Gardi Dance of Muria Tribe')).toBeInTheDocument();
      expect(screen.getByText(/Tribal Folklore/i)).toBeInTheDocument();
    });
  });

  it('opens entry review panel when clicking on an entry card', async () => {
    (fetchEntries as jest.Mock).mockResolvedValue(mockPendingEntries);

    render(React.createElement(AdminModerationPage));

    await waitFor(() => {
      expect(screen.getByText('Gardi Dance of Muria Tribe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Gardi Dance of Muria Tribe'));

    expect(screen.getByText('Payload Preview')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Coordinates verified/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve & Publish/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject Entry/i })).toBeInTheDocument();
  });

  it('approves an entry and calls reviewEntry API with approval payload', async () => {
    (fetchEntries as jest.Mock).mockResolvedValue(mockPendingEntries);
    (reviewEntry as jest.Mock).mockResolvedValue({
      ...mockPendingEntries[0],
      status: 'APPROVED',
    });

    render(React.createElement(AdminModerationPage));

    await waitFor(() => {
      expect(screen.getByText('Gardi Dance of Muria Tribe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Gardi Dance of Muria Tribe'));

    const feedbackInput = screen.getByPlaceholderText(/Coordinates verified/i);
    fireEvent.change(feedbackInput, { target: { value: 'Verified with tribal council documentation.' } });

    const approveBtn = screen.getByRole('button', { name: /Approve & Publish/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(reviewEntry).toHaveBeenCalledWith('entry-bastar-dance', {
        approved: true,
        note: 'Verified with tribal council documentation.',
      });
    });
  });

  it('rejects an entry with reviewer note', async () => {
    (fetchEntries as jest.Mock).mockResolvedValue(mockPendingEntries);
    (reviewEntry as jest.Mock).mockResolvedValue({
      ...mockPendingEntries[0],
      status: 'REJECTED',
    });

    render(React.createElement(AdminModerationPage));

    await waitFor(() => {
      expect(screen.getByText('Gardi Dance of Muria Tribe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Gardi Dance of Muria Tribe'));

    const feedbackInput = screen.getByPlaceholderText(/Coordinates verified/i);
    fireEvent.change(feedbackInput, { target: { value: 'Missing high-resolution archival source.' } });

    const rejectBtn = screen.getByRole('button', { name: /Reject Entry/i });
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(reviewEntry).toHaveBeenCalledWith('entry-bastar-dance', {
        approved: false,
        note: 'Missing high-resolution archival source.',
      });
    });
  });
});
