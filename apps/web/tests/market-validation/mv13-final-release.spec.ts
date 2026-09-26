/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FinalValidationDashboard } from '../../src/components/market-validation/final/FinalValidationDashboard';
import { NinetyDayPlan } from '../../src/components/market-validation/final/NinetyDayPlan';

describe('MV13 Final Market Validation Release Frontend Suite', () => {
  test('FinalValidationDashboard renders decision, rationale and metrics', () => {
    render(
      React.createElement(FinalValidationDashboard, {
        decision: 'CONDITIONAL_GO',
        confidence: 'VERY_HIGH',
        evidenceCount: 184,
        strongEvidenceCount: 142,
      })
    );
    expect(screen.getByTestId('final-validation-dashboard')).toBeInTheDocument();
    expect(screen.getByText('CONDITIONAL GO')).toBeInTheDocument();
    expect(screen.getByText('VERY_HIGH')).toBeInTheDocument();
    expect(screen.getByText('184')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText(/Core market validation successfully demonstrated/)).toBeInTheDocument();
  });

  test('NinetyDayPlan renders 3 phases and action items', () => {
    render(React.createElement(NinetyDayPlan));
    expect(screen.getByTestId('ninety-day-plan')).toBeInTheDocument();
    expect(screen.getByText('Days 1–30')).toBeInTheDocument();
    expect(screen.getByText('Days 31–60')).toBeInTheDocument();
    expect(screen.getByText('Days 61–90')).toBeInTheDocument();
    expect(screen.getByText('Pilot Lockdown & Operational Readiness')).toBeInTheDocument();
    expect(screen.getByText('Cohort Expansion & Monetization Validation')).toBeInTheDocument();
  });
});
