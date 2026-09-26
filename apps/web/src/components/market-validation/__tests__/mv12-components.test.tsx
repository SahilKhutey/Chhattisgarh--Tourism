/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PilotDefinition } from '../PilotDefinition';
import { ScaleGateCard } from '../ScaleGateCard';
import { PilotKpiDashboard } from '../PilotKpiDashboard';
import { LaunchReadinessScorecard } from '../LaunchReadinessScorecard';

describe('MV12 Market Validation Hardening Unit Tests', () => {
  test('PilotDefinition hides active actions in DRAFT status', () => {
    const draftPilot = {
      id: 'pilot-test-draft',
      name: 'Draft Pilot Circuit',
      validation_decision_id: 'MV10-GO-001',
      status: 'DRAFT',
      version: 1,
      minimum_sample: 50,
      target_sample: 200,
      budget_band: 'PILOT_TIER_1',
      launch_owner: 'OPS',
    };
    render(React.createElement(PilotDefinition, { pilot: draftPilot }));
    expect(screen.queryByText('Pause Pilot')).not.toBeInTheDocument();
    expect(screen.queryByText('Resume Pilot')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete Pilot')).not.toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  test('ScaleGateCard renders blocked alert when critical gate fails', () => {
    const failedGates = [
      {
        id: 'g-safety',
        gate_name: 'gate_6_safety_compliance',
        requirement: 'Zero safety incidents',
        metric: 'safety_breaches',
        threshold: 0,
        actual_value: 1,
        status: 'FAILED',
        blocker: true,
      },
    ];
    render(
      React.createElement(ScaleGateCard, {
        gates: failedGates,
        decision: 'STOP',
        rationale: 'Critical safety breach detected.',
      })
    );
    expect(screen.getByText('STOP')).toBeInTheDocument();
    expect(screen.getByText('Critical Blocker')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  test('LaunchReadinessScorecard displays blockers when safety fails', () => {
    render(
      React.createElement(LaunchReadinessScorecard, {
        safetyReady: false,
        overallStatus: 'BLOCKED',
        blockers: ['Critical gate not satisfied: Safety Ready'],
      })
    );
    expect(screen.getByText('BLOCKED')).toBeInTheDocument();
    expect(screen.getByText(/Critical gate not satisfied: Safety Ready/)).toBeInTheDocument();
  });

  test('PilotKpiDashboard displays benchmark comparisons', () => {
    render(React.createElement(PilotKpiDashboard, { totalTravelers: 195 }));
    expect(screen.getByText('195')).toBeInTheDocument();
    expect(screen.getByText('Target: 200')).toBeInTheDocument();
  });
});
