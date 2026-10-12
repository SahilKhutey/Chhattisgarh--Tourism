import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SocialShell,
  SocialNavigation,
  SocialSectionNav,
  SocialBreadcrumbs,
} from '../layout';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/social/feed',
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('Social Engine Phase 8 Layout & Navigation Components', () => {
  describe('SocialShell', () => {
    it('renders children with max-w-7xl and gutter by default', () => {
      const { container } = render(
        <SocialShell>
          <div>Shell Content</div>
        </SocialShell>
      );

      expect(screen.getByText('Shell Content')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('max-w-7xl');
      expect(container.firstChild).toHaveClass('px-4');
    });

    it('supports custom maxWidth', () => {
      const { container } = render(
        <SocialShell maxWidth="5xl" withGutter={false}>
          <div>Inner 5xl</div>
        </SocialShell>
      );

      expect(container.firstChild).toHaveClass('max-w-5xl');
      expect(container.firstChild).not.toHaveClass('px-4');
    });
  });

  describe('SocialNavigation', () => {
    it('renders brand and navigation links with active state indicator', () => {
      render(<SocialNavigation />);

      expect(screen.getByText('Tourism Social')).toBeInTheDocument();
      expect(screen.getByText('Living Discovery')).toBeInTheDocument();

      const feedLink = screen.getByRole('link', { name: /living feed/i });
      expect(feedLink).toBeInTheDocument();
      expect(feedLink).toHaveAttribute('aria-current', 'page');

      expect(screen.getByRole('link', { name: /creators/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /destinations/i })).toBeInTheDocument();
    });
  });

  describe('SocialSectionNav', () => {
    it('renders horizontal feed categories and supports interactive selection', () => {
      const handleSelect = jest.fn();
      render(
        <SocialSectionNav
          activeId="reels"
          onSelect={handleSelect}
        />
      );

      const reelsBtn = screen.getByRole('button', { name: /reels/i });
      expect(reelsBtn).toHaveAttribute('aria-pressed', 'true');

      const shortsBtn = screen.getByRole('button', { name: /shorts/i });
      expect(shortsBtn).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(shortsBtn);
      expect(handleSelect).toHaveBeenCalledWith('shorts');
    });

    it('renders as links when onSelect is not provided', () => {
      render(<SocialSectionNav activeId="all" />);
      const allLink = screen.getByRole('link', { name: /all stories/i });
      expect(allLink).toHaveAttribute('href', '/social/feed');
    });
  });

  describe('SocialBreadcrumbs', () => {
    it('renders breadcrumb trail with accessible semantics', () => {
      render(
        <SocialBreadcrumbs
          items={[
            { label: 'Bastar', href: '/social/districts/bastar' },
            { label: 'Chitrakote Falls' },
          ]}
        />
      );

      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();

      expect(screen.getByRole('link', { name: /social/i })).toHaveAttribute(
        'href',
        '/social'
      );
      expect(screen.getByRole('link', { name: /bastar/i })).toHaveAttribute(
        'href',
        '/social/districts/bastar'
      );

      const currentItem = screen.getByText('Chitrakote Falls');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });
  });
});
