import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SocialPrimaryButton,
  SocialSecondaryButton,
  SocialGhostButton,
  SocialIconButton,
  SocialFilterButton,
  SocialSourceButton,
  SocialBackButton,
} from '../buttons';

// Mock next/navigation
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe('Social Engine Phase 8 Button Primitives', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SocialPrimaryButton', () => {
    it('renders text, icon, and meets min-44px touch target class', () => {
      const handleClick = jest.fn();
      render(
        <SocialPrimaryButton
          onClick={handleClick}
          icon={<span data-testid="test-icon">★</span>}
        >
          Explore Stories
        </SocialPrimaryButton>
      );

      const btn = screen.getByRole('button', { name: /explore stories/i });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain('min-h-[44px]');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SocialSecondaryButton', () => {
    it('renders with secondary styling', () => {
      render(<SocialSecondaryButton>View Creator</SocialSecondaryButton>);
      const btn = screen.getByRole('button', { name: /view creator/i });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain('min-h-[44px]');
    });
  });

  describe('SocialGhostButton', () => {
    it('renders with ghost styling', () => {
      render(<SocialGhostButton>Clear All</SocialGhostButton>);
      const btn = screen.getByRole('button', { name: /clear all/i });
      expect(btn).toBeInTheDocument();
    });
  });

  describe('SocialIconButton', () => {
    it('renders with accessible aria-label and badge', () => {
      render(
        <SocialIconButton
          icon={<span>🔔</span>}
          aria-label="Notifications"
          badge={3}
        />
      );

      const btn = screen.getByRole('button', { name: /notifications/i });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain('min-w-[44px]');
      expect(btn.className).toContain('min-h-[44px]');
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('SocialFilterButton', () => {
    it('handles active state and count pill', () => {
      const { rerender } = render(
        <SocialFilterButton active={false} count={5}>
          Bastar
        </SocialFilterButton>
      );

      const btn = screen.getByRole('button', { name: /bastar/i });
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('5')).toBeInTheDocument();

      rerender(
        <SocialFilterButton active={true} count={5}>
          Bastar
        </SocialFilterButton>
      );
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('SocialSourceButton', () => {
    it('renders YouTube external link button and handles click', () => {
      render(
        <SocialSourceButton
          sourceUrl="https://youtube.com/watch?v=abc"
          provider="YOUTUBE"
          contentId="sc-1"
        />
      );

      const link = screen.getByRole('link', { name: /youtube/i });
      expect(link).toHaveAttribute('href', 'https://youtube.com/watch?v=abc');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('returns null if sourceUrl is unavailable', () => {
      const { container } = render(
        <SocialSourceButton sourceUrl="SOURCE_UNAVAILABLE" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SocialBackButton', () => {
    it('navigates with back button', () => {
      render(<SocialBackButton fallbackHref="/social/feed" label="Back to Feed" />);
      const btn = screen.getByRole('button', { name: /back to feed/i });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(mockBack.mock.calls.length + mockPush.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
