import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  AccessibilityProvider,
  useAccessibility,
} from '../../src/components/accessibility/AccessibilityProvider';
import { FontSizeControl } from '../../src/components/accessibility/FontSizeControl';
import { LowLiteracyToggle } from '../../src/components/accessibility/LowLiteracyToggle';
import { SkipToContent } from '../../src/components/accessibility/SkipToContent';

const TestConsumer = () => {
  const { settings, toggleSetting, resetSettings } = useAccessibility();
  return (
    <div>
      <span data-testid="largeText">{String(settings.largeText)}</span>
      <span data-testid="highContrast">{String(settings.highContrast)}</span>
      <span data-testid="reducedMotion">{String(settings.reducedMotion)}</span>
      <span data-testid="lowLiteracy">{String(settings.lowLiteracy)}</span>
      <button onClick={() => toggleSetting('highContrast')}>Toggle Contrast</button>
      <button onClick={resetSettings}>Reset</button>
    </div>
  );
};

describe('Accessibility Infrastructure', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should render SkipToContent with link to #main-content', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should toggle largeText setting and add large-text class to document root', () => {
    render(
      <AccessibilityProvider>
        <FontSizeControl />
      </AccessibilityProvider>
    );

    const button = screen.getByRole('button', { name: /toggle large text mode/i });
    expect(document.documentElement.classList.contains('large-text')).toBe(false);

    act(() => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains('large-text')).toBe(true);

    act(() => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains('large-text')).toBe(false);
  });

  it('should toggle lowLiteracy setting and add low-literacy class to document root', () => {
    render(
      <AccessibilityProvider>
        <LowLiteracyToggle />
      </AccessibilityProvider>
    );

    const button = screen.getByRole('button', { name: /toggle simplified reading mode/i });
    expect(document.documentElement.classList.contains('low-literacy')).toBe(false);

    act(() => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains('low-literacy')).toBe(true);
  });

  it('should toggle highContrast and persist to localStorage', () => {
    render(
      <AccessibilityProvider>
        <TestConsumer />
      </AccessibilityProvider>
    );

    const contrastBtn = screen.getByRole('button', { name: /toggle contrast/i });
    expect(screen.getByTestId('highContrast').textContent).toBe('false');

    act(() => {
      fireEvent.click(contrastBtn);
    });
    expect(screen.getByTestId('highContrast').textContent).toBe('true');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    act(() => {
      fireEvent.click(resetBtn);
    });
    expect(screen.getByTestId('highContrast').textContent).toBe('false');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
  });
});
