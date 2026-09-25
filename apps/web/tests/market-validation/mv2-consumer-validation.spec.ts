/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PainScore } from '../../src/components/market-validation/PainScore';
import { ValidationScore } from '../../src/components/market-validation/ValidationScore';
import { ProblemCard, ConsumerProblemData } from '../../src/components/market-validation/ProblemCard';
import { JTBDCard, JTBDData } from '../../src/components/market-validation/JTBDCard';
import { EvidenceCard, EvidenceData } from '../../src/components/market-validation/EvidenceCard';
import { ResearchDashboard, ResearchSummaryData } from '../../src/components/market-validation/ResearchDashboard';
import { ParticipantForm } from '../../src/components/market-validation/ParticipantForm';
import { InterviewTimeline } from '../../src/components/market-validation/InterviewTimeline';

describe('MV2 Consumer Problem Validation Suite', () => {
  test('PainScore renders quantitative score and breakdown correctly', () => {
    render(
      React.createElement(PainScore, {
        score: 320,
        frequency: 5,
        severity: 4,
        timeCost: 4,
        trustImpact: 4,
      })
    );
    expect(screen.getByText(/Pain: 320/)).toBeInTheDocument();
    expect(screen.getByText(/Tier 1: High Urgency/)).toBeInTheDocument();
    expect(screen.getByText(/F:5 × S:4 × T:4 × Tr:4/)).toBeInTheDocument();
  });

  test('ValidationScore renders badge and confidence ratio', () => {
    render(
      React.createElement(ValidationScore, {
        status: 'STRONGLY_SUPPORTED',
        confidenceScore: 1.8,
        supportingCount: 16,
        totalEvaluated: 20,
      })
    );
    expect(screen.getByText('STRONGLY SUPPORTED')).toBeInTheDocument();
    expect(screen.getByText('1.8')).toBeInTheDocument();
    expect(screen.getByText('(16/20)')).toBeInTheDocument();
  });

  test('ProblemCard displays problem statement, current behavior, workaround, and pain score', () => {
    const problem: ConsumerProblemData = {
      id: 'prob-101',
      journey_stage: 'PLANNING',
      problem_statement: 'Cannot determine if Bastar attractions can be combined in one day',
      current_behavior: 'Add pins in Google Maps without knowing road quality',
      workaround: 'Call hotel reception or ask local driver',
      frequency: 5,
      severity: 4,
      time_cost: 4,
      trust_impact: 4,
      pain_score: 320,
      evidence_strength: 'DIRECT_BEHAVIOR',
      related_jtbd: 'JTBD-3',
      cluster_tag: 'REGIONAL_DISCOVERY_CONTEXT',
      status: 'SUPPORTED',
    };

    render(React.createElement(ProblemCard, { problem }));
    expect(screen.getByText(problem.problem_statement)).toBeInTheDocument();
    expect(screen.getByText(problem.current_behavior)).toBeInTheDocument();
    expect(screen.getByText(problem.workaround)).toBeInTheDocument();
    expect(screen.getByText('JTBD-3')).toBeInTheDocument();
    expect(screen.getByText('#REGIONAL_DISCOVERY_CONTEXT')).toBeInTheDocument();
  });

  test('JTBDCard displays core job and triggers support/invalidate callbacks', () => {
    const jtbd: JTBDData = {
      id: 'jtbd-03',
      jtbd_key: 'JTBD-3',
      title: 'Plan',
      description: 'I want to turn several places into a realistic trip.',
      status: 'SUPPORTED',
      total_interviews_evaluated: 20,
      supporting_interviews_count: 15,
      direct_behavior_count: 7,
      confidence_score: 1.5,
      evidence_summary: 'Observed heavy reliance on manual notes and fragmented maps.',
    };

    const handleSupport = jest.fn();
    const handleInvalidate = jest.fn();

    render(
      React.createElement(JTBDCard, {
        jtbd,
        onSupport: handleSupport,
        onInvalidate: handleInvalidate,
      })
    );

    expect(screen.getByText('JTBD-3')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText(`"${jtbd.description}"`)).toBeInTheDocument();

    const supportBtn = screen.getByRole('button', { name: /support/i });
    fireEvent.click(supportBtn);
    expect(handleSupport).toHaveBeenCalledWith(jtbd);

    const invalidateBtn = screen.getByRole('button', { name: /invalidate/i });
    fireEvent.click(invalidateBtn);
    expect(handleInvalidate).toHaveBeenCalledWith(jtbd);
  });

  test('EvidenceCard displays observation, source, and confidence', () => {
    const evidence: EvidenceData = {
      id: 'ev-01',
      evidence_type: 'DIRECT_BEHAVIOR',
      observation: 'Participant opened 7 distinct apps over 22 minutes to plan Bastar trip.',
      source: 'LIVE_OBSERVATION_TASK_P12',
      researcher_confidence: 5,
      jtbd_id: 'JTBD-3',
    };

    render(React.createElement(EvidenceCard, { evidence }));
    expect(screen.getByText(evidence.observation)).toBeInTheDocument();
    expect(screen.getByText(evidence.source)).toBeInTheDocument();
    expect(screen.getByText(/5\/5/)).toBeInTheDocument();
    expect(screen.getByText('JTBD-3')).toBeInTheDocument();
  });

  test('InterviewTimeline marks passed and current lifecycle steps', () => {
    render(React.createElement(InterviewTimeline, { currentStatus: 'CONDUCTED' }));
    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Conducted')).toBeInTheDocument();
    expect(screen.getByText('Transcribed')).toBeInTheDocument();
  });

  test('ResearchDashboard renders executive overview, journey problems, and validated JTBDs', () => {
    const summary: ResearchSummaryData = {
      participants_count: 42,
      interviews_count: 31,
      problems_count: 87,
      strongest_problem: 'Regional trip planning uncertainty',
      highest_pain_cluster: 'GEOGRAPHIC_FEASIBILITY',
      most_fragmented_workflow: 'Discovery → Planning',
      journey_distribution: {
        DISCOVERY: 15,
        PLANNING: 25,
        EVALUATION: 10,
      },
      validated_jtbds: [
        { key: 'JTBD-1', title: 'Discover', status: 'SUPPORTED' },
        { key: 'JTBD-3', title: 'Plan', status: 'STRONGLY_SUPPORTED' },
      ],
    };

    render(React.createElement(ResearchDashboard, { summary }));
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
    expect(screen.getByText('87')).toBeInTheDocument();
    expect(screen.getByText('Regional trip planning uncertainty')).toBeInTheDocument();
    expect(screen.getByText('GEOGRAPHIC_FEASIBILITY')).toBeInTheDocument();
    expect(screen.getByText('Discovery → Planning')).toBeInTheDocument();
    expect(screen.getByText('DISCOVERY')).toBeInTheDocument();
    expect(screen.getByText('PLANNING')).toBeInTheDocument();
  });

  test('ParticipantForm enforces consent check', async () => {
    const handleSuccess = jest.fn();
    const handleCancel = jest.fn();

    render(React.createElement(ParticipantForm, { onSuccess: handleSuccess, onCancel: handleCancel }));
    const originInput = screen.getByPlaceholderText(/e\.g\. Bengaluru/i);
    fireEvent.change(originInput, { target: { value: 'Raipur' } });

    const consentCheck = screen.getByLabelText(/informed consent/i);
    fireEvent.click(consentCheck); // uncheck consent

    const submitBtn = screen.getByRole('button', { name: /register anonymous participant/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/must provide explicit informed consent/i)).toBeInTheDocument();
    expect(handleSuccess).not.toHaveBeenCalled();
  });
});
