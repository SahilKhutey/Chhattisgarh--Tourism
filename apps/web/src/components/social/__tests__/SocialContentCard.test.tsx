/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialContentCard } from '../SocialContentCard';
import { MOCK_SOCIAL_CONTENT } from '@/lib/social/mock-data';

describe('SocialContentCard Component', () => {
  const item = MOCK_SOCIAL_CONTENT[0]; // Chitrakote Falls Reel

  it('renders standard social card with creator, format badge, and place', () => {
    render(<SocialContentCard content={item} variant="default" />);

    expect(screen.getByText(item.title)).toBeInTheDocument();
    expect(screen.getByText(item.creator!.display_name)).toBeInTheDocument();
    expect(screen.getByText('Reel')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
  });

  it('contains accessible external source action with target _blank', () => {
    render(<SocialContentCard content={item} variant="default" />);

    const sourceBtn = screen.getByRole('link', { name: /open original content on instagram/i });
    expect(sourceBtn).toHaveAttribute('href', item.source_url);
    expect(sourceBtn).toHaveAttribute('target', '_blank');
    expect(sourceBtn).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders featured variant with description', () => {
    render(<SocialContentCard content={item} variant="featured" showDescription={true} />);

    expect(screen.getByText(item.title)).toBeInTheDocument();
    expect(screen.getByText(item.caption)).toBeInTheDocument();
  });
});
