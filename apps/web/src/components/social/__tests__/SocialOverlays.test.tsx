import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SocialMediaLightbox,
  SocialShareSheet,
  SocialFilterDrawer,
} from '../overlays';
import { MOCK_SOCIAL_CONTENT } from '@/lib/social/mock-data';

describe('Social Engine Phase 8 Interactive Overlays', () => {
  const sampleContent = MOCK_SOCIAL_CONTENT[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SocialMediaLightbox', () => {
    it('renders fullscreen preview when open', () => {
      const handleClose = jest.fn();
      render(
        <SocialMediaLightbox
          content={sampleContent}
          isOpen={true}
          onClose={handleClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(sampleContent.title)).toBeInTheDocument();

      // Check Tourism Action Gateway
      const planBtn = screen.getByRole('button', { name: /plan visit to/i });
      expect(planBtn).toBeInTheDocument();

      // Check Close Button
      const closeBtn = screen.getByRole('button', { name: /close media preview/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
      const handleClose = jest.fn();
      render(
        <SocialMediaLightbox
          content={sampleContent}
          isOpen={true}
          onClose={handleClose}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('returns null when closed', () => {
      const { container } = render(
        <SocialMediaLightbox
          content={sampleContent}
          isOpen={false}
          onClose={jest.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('SocialShareSheet', () => {
    it('renders share sheet with copy link and platforms', async () => {
      const handleClose = jest.fn();
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(
        <SocialShareSheet
          isOpen={true}
          onClose={handleClose}
          title={sampleContent.title}
          url="https://tourism.cg.gov.in/social/content/sc-1"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Share Discovery')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: /copy link/i });
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://tourism.cg.gov.in/social/content/sc-1'
      );
    });
  });

  describe('SocialFilterDrawer', () => {
    it('renders filter drawer and executes apply and reset', () => {
      const handleApply = jest.fn();
      const handleReset = jest.fn();
      const handleClose = jest.fn();

      render(
        <SocialFilterDrawer
          isOpen={true}
          onClose={handleClose}
          currentFilters={{ platform: 'YOUTUBE' }}
          onApply={handleApply}
          onReset={handleReset}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Filter Discoveries')).toBeInTheDocument();

      // Click on Instagram
      const igBtn = screen.getByRole('button', { name: 'Instagram' });
      fireEvent.click(igBtn);

      // Apply
      const applyBtn = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalledWith(
        expect.objectContaining({ platform: 'INSTAGRAM' })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Reset
      const resetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });
});
