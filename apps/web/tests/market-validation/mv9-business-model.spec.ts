/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { BusinessModelCanvas } from '../../src/components/market-validation/BusinessModelCanvas';
import { RevenueStreamTable } from '../../src/components/market-validation/RevenueStreamTable';
import { PricingExperiment } from '../../src/components/market-validation/PricingExperiment';
import { WillingnessToPayCard } from '../../src/components/market-validation/WillingnessToPayCard';
import { ProviderPricingCard } from '../../src/components/market-validation/ProviderPricingCard';
import { UnitEconomicsTable } from '../../src/components/market-validation/UnitEconomicsTable';
import { ContributionMarginCard } from '../../src/components/market-validation/ContributionMarginCard';
import { BusinessExperimentCard } from '../../src/components/market-validation/BusinessExperimentCard';
import { BusinessInsights } from '../../src/components/market-validation/BusinessInsights';

describe('MV9 Business Model & Monetization Validation Frontend Suite', () => {
  test('BusinessModelCanvas renders 9-box sections and hypotheses', () => {
    const hypotheses = [
      {
        id: 'H-MV9-001',
        statement: 'Providers will pay for qualified tourism leads.',
        target_side: 'PROVIDER',
        status: 'STRONGLY_SUPPORTED',
        observation: '74% of verified hosts agreed to ₹20-30/lead pricing.',
        confidence: 0.88,
      },
    ];

    render(React.createElement(BusinessModelCanvas, { hypotheses }));
    expect(screen.getByTestId('business-model-canvas')).toBeInTheDocument();
    expect(screen.getByText('CG Tourism OS — Business Model Canvas')).toBeInTheDocument();
    expect(screen.getByText('Customer Segments')).toBeInTheDocument();
    expect(screen.getByText('Value Propositions')).toBeInTheDocument();
    expect(screen.getByText('Revenue Streams')).toBeInTheDocument();
    expect(screen.getByText('Cost Structure')).toBeInTheDocument();
    expect(screen.getAllByText(/H-MV9-001/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/88% Conf/)).toBeInTheDocument();
  });

  test('RevenueStreamTable renders stream pricing and margins', () => {
    render(React.createElement(RevenueStreamTable));
    expect(screen.getByTestId('revenue-stream-table')).toBeInTheDocument();
    expect(screen.getByText('Revenue Streams Inventory')).toBeInTheDocument();
    expect(screen.getByText('QUALIFIED_LEAD_FEE')).toBeInTheDocument();
    expect(screen.getByText('₹25.00')).toBeInTheDocument();
    expect(screen.getByText('per qualified lead')).toBeInTheDocument();
    expect(screen.getByText('18.0%')).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
  });

  test('PricingExperiment renders control and variant metrics and elasticity', () => {
    render(
      React.createElement(PricingExperiment, {
        experimentId: 'EXP-LEAD-TEST',
        recommendedPrice: 25.0,
        elasticity: -0.063,
      })
    );
    expect(screen.getByTestId('pricing-experiment')).toBeInTheDocument();
    expect(screen.getByText(/Pricing Elasticity Experiment/)).toBeInTheDocument();
    expect(screen.getByText('Optimal: ₹25.00')).toBeInTheDocument();
    expect(screen.getByText('-0.063')).toBeInTheDocument();
    expect(screen.getByText('WINNER')).toBeInTheDocument();
  });

  test('WillingnessToPayCard displays commitment rate, conversion, and price spectrum', () => {
    render(
      React.createElement(WillingnessToPayCard, {
        participantType: 'PROVIDER',
        commitmentRate: 0.60,
        conversionRate: 0.428,
        optimalPricePoint: 25.0,
      })
    );
    expect(screen.getByTestId('willingness-to-pay-card')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('42.8%')).toBeInTheDocument();
    expect(screen.getByText('Van Westendorp Price Range Spectrum')).toBeInTheDocument();
    expect(screen.getByText('Optimal: ₹25')).toBeInTheDocument();
  });

  test('ProviderPricingCard renders tiers with recommended badge', () => {
    render(React.createElement(ProviderPricingCard));
    expect(screen.getByTestId('provider-pricing-card')).toBeInTheDocument();
    expect(screen.getByText('Standard Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Verified Traveler Lead')).toBeInTheDocument();
    expect(screen.getByText('Pro Operator Subscription')).toBeInTheDocument();
    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument();
    expect(screen.getByText('₹25')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
  });

  test('UnitEconomicsTable displays LTV/CAC ratios and viability verdict', () => {
    render(
      React.createElement(UnitEconomicsTable, {
        blendedLtvCac: 8.5,
        isViable: true,
      })
    );
    expect(screen.getByTestId('unit-economics-table')).toBeInTheDocument();
    expect(screen.getByText('Unit Economics & LTV/CAC Ledger')).toBeInTheDocument();
    expect(screen.getByText(/Blended LTV\/CAC: 8\.5x/)).toBeInTheDocument();
    expect(screen.getByText('VIABLE (LTV/CAC > 3x)')).toBeInTheDocument();
    expect(screen.getByText(/12\.5x/)).toBeInTheDocument();
  });

  test('ContributionMarginCard displays gross revenue, variable costs, and net margin', () => {
    render(
      React.createElement(ContributionMarginCard, {
        grossRevenue: 146000.0,
        netContribution: 122500.0,
        contributionMarginPct: 83.9,
      })
    );
    expect(screen.getByTestId('contribution-margin-card')).toBeInTheDocument();
    expect(screen.getByText(/₹(146,000|1,46,000)/)).toBeInTheDocument();
    expect(screen.getByText(/83.9%/)).toBeInTheDocument();
    expect(screen.getByText('Payment Gateway Fees (2%)')).toBeInTheDocument();
  });

  test('BusinessExperimentCard displays variant comparison and winner', () => {
    render(React.createElement(BusinessExperimentCard));
    expect(screen.getByTestId('business-experiment-card')).toBeInTheDocument();
    expect(screen.getByText('Business Model Experiment Evaluation')).toBeInTheDocument();
    expect(screen.getByText('Decision: WINNER_VARIANT')).toBeInTheDocument();
    expect(screen.getByText('WINNING VARIANT')).toBeInTheDocument();
  });

  test('BusinessInsights displays SEVF, Go/No-Go decision, and guardrails', () => {
    render(
      React.createElement(BusinessInsights, {
        sevfInr: 1250000.0,
        recommendation: 'GO',
      })
    );
    expect(screen.getByTestId('business-insights')).toBeInTheDocument();
    expect(screen.getByText('MV9 Executive Business Model Synthesis')).toBeInTheDocument();
    expect(screen.getByText(/(1,250,000|12,50,000)/)).toBeInTheDocument();
    expect(screen.getByText('DECISION: GO')).toBeInTheDocument();
    expect(screen.getByText(/Trust Protection & Governance Guardrails \(4\/4 Compliant\)/)).toBeInTheDocument();
    expect(screen.getByText('Zero-Monetization Discovery')).toBeInTheDocument();
    expect(screen.getByText('Zero Rank Manipulation')).toBeInTheDocument();
  });
});
