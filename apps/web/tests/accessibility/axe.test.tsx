import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LanguageSwitcher } from '../../src/components/LanguageSwitcher';
import { LanguageProvider } from '../../src/context/LanguageContext';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('Accessibility Testing (Axe)', () => {
  test('LanguageSwitcher should have no accessibility violations', async () => {
    const { container } = render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
