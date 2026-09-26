/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PilotDefinition } from '../../src/components/market-validation/PilotDefinition';
import { MarketSelectionMatrix } from '../../src/components/market-validation/MarketSelectionMatrix';
import { PilotScopeCard } from '../../src/components/market-validation/PilotScopeCard';
import { LaunchReadinessScorecard } from '../../src/components/market-validation/LaunchReadinessScorecard';
import { ScaleGateCard } from '../../src/components/market-validation/ScaleGateCard';
import { LaunchControlPanel } from '../../src/components/market-validation/LaunchControlPanel';
import { OperationalReadiness } from '../../src/components/market-validation/OperationalReadiness';
import { ExpansionCandidateTable } from '../../src/components/market-validation/ExpansionCandidateTable';
import { PilotKpiDashboard } from '../../src/components/market-validation/PilotKpiDashboard';

describe('MV11 Pilot & Scale Readiness Frontend Suite', () => {
  const dummyPilot = {
    id: 'pilot-bastar-001',
    name: 'Bastar Tribal Circuit Pilot',
    validation_decision_id: 'MV10-GO-001',
    status: 'ACTIVE',
    version: 2,
    minimum_sample: 50,
    target_sample: 200,
    budget_band: 'PILOT_TIER_1_INR_50K',
    launch_owner: 'PRODUCT_LEAD',
    geography_scope: {
      division: 'Bastar',
      tourism_zone: 'Chitrakote-Kanger',
    },
    product_scope: {
      in_scope: ['destination_discovery', 'trip_planning'],
      out_of_scope: ['statewide_marketplace'],
    },
  };

  test('PilotDefinition renders status, lifecycle buttons and scopes', () => {
    render(
      React.createElement(PilotDefinition, {
        pilot: dummyPilot,
        onPause: jest.fn(),
        onComplete: jest.fn(),
      })
    );
    expect(screen.getByTestId('pilot-definition')).toBeInTheDocument();
    expect(screen.getByText('Bastar Tribal Circuit Pilot')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('Pause Pilot')).toBeInTheDocument();
    expect(screen.getByText('Complete Pilot')).toBeInTheDocument();
  });

  test('MarketSelectionMatrix renders candidate rankings with composite score', () => {
    const markets = [
      {
        id: 'm1',
        geography_id: 'Bastar',
        demand_score: 88,
        supply_score: 78,
        content_score: 85,
        geographic_score: 90,
        accessibility_score: 68,
        operational_score: 75,
        risk_score: 24,
        evidence_strength: 'STRONG',
        pilot_priority: 1,
        recommendation: 'RECOMMENDED_PILOT',
        composite_score: 78.5,
      },
    ];
    render(React.createElement(MarketSelectionMatrix, { markets }));
    expect(screen.getByTestId('market-selection-matrix')).toBeInTheDocument();
    expect(screen.getByText('Bastar')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('78.5')).toBeInTheDocument();
  });

  test('PilotScopeCard renders in-scope and out-of-scope boundaries', () => {
    render(React.createElement(PilotScopeCard));
    expect(screen.getByTestId('pilot-scope-card')).toBeInTheDocument();
    expect(screen.getByText('✓ In-Scope for Pilot')).toBeInTheDocument();
    expect(screen.getByText('✗ Explicitly Out-of-Scope')).toBeInTheDocument();
    expect(screen.getByText(/Destination discovery/)).toBeInTheDocument();
  });

  test('LaunchReadinessScorecard renders 12 gates and percentage', () => {
    render(
      React.createElement(LaunchReadinessScorecard, {
        readinessPercentage: 100,
        overallStatus: 'READY',
      })
    );
    expect(screen.getByTestId('launch-readiness-scorecard')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('READY')).toBeInTheDocument();
    expect(screen.getByText('Safety Protocols')).toBeInTheDocument();
  });

  test('ScaleGateCard renders 10 scale gates and decision badge', () => {
    const gates = [
      {
        id: 'g1',
        gate_name: 'gate_1_consumer_demand',
        requirement: 'Conversion >= 20%',
        metric: 'discovery_to_plan_rate',
        threshold: 0.2,
        actual_value: 0.25,
        status: 'PASSED',
        blocker: true,
      },
    ];
    render(
      React.createElement(ScaleGateCard, {
        gates,
        decision: 'SCALE',
        rationale: 'All critical gates passed successfully.',
      })
    );
    expect(screen.getByTestId('scale-gate-card')).toBeInTheDocument();
    expect(screen.getByText('SCALE')).toBeInTheDocument();
    expect(screen.getByText(/GATE 1 CONSUMER DEMAND/)).toBeInTheDocument();
    expect(screen.getByText('0.25')).toBeInTheDocument();
  });

  test('LaunchControlPanel renders circuit breakers and threshold actions', () => {
    const controls = [
      {
        id: 'c1',
        control_type: 'TRAFFIC_LIMIT',
        name: 'Max Daily Active Travelers',
        enabled: true,
        threshold: 500,
        current_value: 120,
        action: 'THROTTLE',
        owner: 'SYSTEM',
        triggered: false,
      },
    ];
    render(React.createElement(LaunchControlPanel, { controls }));
    expect(screen.getByTestId('launch-control-panel')).toBeInTheDocument();
    expect(screen.getByText('Max Daily Active Travelers')).toBeInTheDocument();
    expect(screen.getByText('ARMED')).toBeInTheDocument();
    expect(screen.getByText('THROTTLE')).toBeInTheDocument();
  });

  test('OperationalReadiness displays founder decoupling ratio', () => {
    render(
      React.createElement(OperationalReadiness, {
        founderInterventionRate: 0.117,
        readinessStatus: 'READY',
      })
    );
    expect(screen.getByTestId('operational-readiness')).toBeInTheDocument();
    expect(screen.getByText('11.7%')).toBeInTheDocument();
    expect(screen.getByText('READY')).toBeInTheDocument();
    expect(screen.getByText('Support Desk Capacity')).toBeInTheDocument();
  });

  test('ExpansionCandidateTable renders ranked candidate circuits', () => {
    const candidates = [
      {
        id: 'e1',
        current_market_id: 'Bastar',
        candidate_market_id: 'Surguja',
        similarity_score: 78,
        demand_score: 70,
        supply_score: 62,
        geographic_fit: 75,
        operational_fit: 65,
        economic_fit: 68,
        expansion_risk: 22,
        composite_expansion_score: 68.5,
        recommendation: 'RECOMMENDED_NEXT_EXPANSION',
      },
    ];
    render(React.createElement(ExpansionCandidateTable, { candidates }));
    expect(screen.getByTestId('expansion-candidate-table')).toBeInTheDocument();
    expect(screen.getByText('Surguja')).toBeInTheDocument();
    expect(screen.getByText('68.5')).toBeInTheDocument();
    expect(screen.getByText('RECOMMENDED NEXT EXPANSION')).toBeInTheDocument();
  });

  test('PilotKpiDashboard renders performance metrics against benchmarks', () => {
    render(React.createElement(PilotKpiDashboard));
    expect(screen.getByTestId('pilot-kpi-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Pilot Travelers Sample')).toBeInTheDocument();
    expect(screen.getByText('184')).toBeInTheDocument();
    expect(screen.getByText('26.4%')).toBeInTheDocument();
  });
});
