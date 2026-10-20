/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CohortExpansionPanel } from '../CohortExpansionPanel';
import { ScaleGovernancePanel } from '../ScaleGovernancePanel';

describe('CohortExpansionPanel & ScaleGovernancePanel Unit Tests', () => {
  test('CohortExpansionPanel renders 160 leads, ₹25 economics, and feeder cohorts', () => {
    render(React.createElement(CohortExpansionPanel));

    // Milestone and Volume
    expect(screen.getAllByText('160').length).toBeGreaterThan(0);
    expect(screen.getByText(/150 target/i)).toBeInTheDocument();

    // ₹25 Economics & Margin
    expect(screen.getByText('98.6%')).toBeInTheDocument();
    expect(screen.getByText(/4,000 rev/i)).toBeInTheDocument();

    // Feeder cohorts present
    expect(screen.getByText('Raipur Urban Experiential Explorers')).toBeInTheDocument();
    expect(screen.getByText('Nagpur Wildlife & Cultural Enthusiasts')).toBeInTheDocument();
    expect(screen.getByText('Hyderabad Heritage & Adventure Pilgrims')).toBeInTheDocument();

    // Filter button interaction
    const raipurBtn = screen.getByRole('button', { name: /Raipur/i });
    fireEvent.click(raipurBtn);

    expect(screen.getByText('Raipur Urban Experiential Explorers')).toBeInTheDocument();
    expect(screen.queryByText('Nagpur Wildlife & Cultural Enthusiasts')).not.toBeInTheDocument();
  });

  test('ScaleGovernancePanel renders 10 scale gates and SCALE decision', () => {
    render(React.createElement(ScaleGovernancePanel));

    // Decision badge
    expect(screen.getByText(/SCALE • AUTHORIZED/i)).toBeInTheDocument();
    expect(screen.getByText(/10 of 10 Gates Passed/i)).toBeInTheDocument();

    // Scale gates scorecard items
    expect(screen.getByText('Safety & Zero Critical Incidents')).toBeInTheDocument();
    expect(screen.getByText('Founder Decoupling Telemetry')).toBeInTheDocument();
    expect(screen.getByText('Secondary Circuit Transferability')).toBeInTheDocument();

    // Tab switch to Surguja Expansion Blueprint
    const dossierTabBtn = screen.getByRole('button', { name: /Surguja Expansion Blueprint/i });
    fireEvent.click(dossierTabBtn);

    expect(screen.getByText('Mainpat Hill Plateau')).toBeInTheDocument();
    expect(screen.getByText('Ramgarh Caves & Amphitheatre')).toBeInTheDocument();
    expect(screen.getByText('Tatapani Geothermal Springs')).toBeInTheDocument();
    expect(screen.getByText('Kailash Gufa & Bageesha')).toBeInTheDocument();
    expect(screen.getByText(/12 Homestays • 8 Guides/i)).toBeInTheDocument();
  });
});
