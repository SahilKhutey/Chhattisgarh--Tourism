/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SurgujaCircuitOverview } from '../SurgujaCircuitOverview';

describe('SurgujaCircuitOverview Component Unit Tests', () => {
  test('renders 4 landmark destinations and altitude metadata', () => {
    render(React.createElement(SurgujaCircuitOverview));

    expect(screen.getByText('Surguja Ecotourism & Highland Heritage Circuit')).toBeInTheDocument();
    expect(screen.getByText('Mainpat Hill Plateau')).toBeInTheDocument();
    expect(screen.getByText('Ramgarh Caves & Amphitheatre')).toBeInTheDocument();
    expect(screen.getByText('Tatapani Geothermal Springs')).toBeInTheDocument();
    expect(screen.getByText('Kailash Gufa & Bageesha')).toBeInTheDocument();

    // Verify 1150m altitude pill for Mainpat
    expect(screen.getByText('1150m')).toBeInTheDocument();
  });

  test('toggles to Safety SOS Roster and invokes killswitch simulator', () => {
    const handleSimulate = jest.fn();
    render(
      React.createElement(SurgujaCircuitOverview, {
        onSimulateIncident: handleSimulate,
        isSimulating: false,
      })
    );

    // Switch to Safety SOS Roster tab
    const rosterTabBtn = screen.getByRole('button', { name: /Safety SOS Roster/i });
    fireEvent.click(rosterTabBtn);

    expect(screen.getByText('Ambikapur GMC Trauma Center')).toBeInTheDocument();
    expect(screen.getByText('Sitapur Community Health Center & Forest Post')).toBeInTheDocument();
    expect(screen.getByText('Ramanujganj Primary Health & Thermal Range Unit')).toBeInTheDocument();

    // Test Safety Killswitch button
    const killswitchBtn = screen.getByRole('button', { name: /Test Safety Killswitch/i });
    fireEvent.click(killswitchBtn);
    expect(handleSimulate).toHaveBeenCalledTimes(1);
  });
});
