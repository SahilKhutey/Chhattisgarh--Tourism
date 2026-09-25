/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GeoRelationshipEditor, GeoRelationshipData } from '../../src/components/market-validation/GeoRelationshipEditor';
import { GeographicExperiment, GeoExperimentData } from '../../src/components/market-validation/GeographicExperiment';
import { RouteExperiment, RouteValidationData } from '../../src/components/market-validation/RouteExperiment';
import { NearbyPlacesPanel, NearbyPlaceItem } from '../../src/components/market-validation/NearbyPlacesPanel';
import { GeoValidationMap, GeoMapPoint, GeoMapEdge } from '../../src/components/market-validation/GeoValidationMap';
import { GeoEvidenceCard, GeoEvidenceItem } from '../../src/components/market-validation/GeoEvidenceCard';
import { GeographicInsights } from '../../src/components/market-validation/GeographicInsights';

describe('MV4 Regional & Geographic Validation Suite', () => {
  test('GeoRelationshipEditor renders fields and calls onSave', () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    render(
      React.createElement(GeoRelationshipEditor, {
        onSave: handleSave,
        onCancel: handleCancel,
      })
    );

    expect(screen.getByText('Establish Geographic Relationship')).toBeInTheDocument();
    expect(screen.getByText('Save Relationship')).toBeInTheDocument();

    const saveButton = screen.getByText('Save Relationship');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        source_destination_id: 'DEST_JAGDALPUR',
        target_destination_id: 'DEST_CHITRAKOTE',
        relationship_type: 'NEARBY',
        validation_status: 'PROVISIONAL',
      })
    );
  });

  test('GeographicExperiment renders experiment metrics, lift and triggers callbacks', () => {
    const experiment: GeoExperimentData = {
      id: 'exp-001',
      experiment_key: 'EXP-GEO-001',
      name: 'Nearby Discovery Contextual Panel Test',
      hypothesis_key: 'H-MV4-001',
      status: 'RUNNING',
      control_description: 'Standard destination page without nearby cluster',
      variant_description: 'Contextual nearby cluster with travel times',
      primary_metric_name: 'nearby_planning_activation_rate',
      control_metric_value: 0.18,
      variant_metric_value: 0.42,
      sample_size_control: 50,
      sample_size_variant: 50,
      lift_percentage: 133.33,
      outcome: 'VARIANT_STRONGLY_OUTPERFORMS',
    };

    const handleAddObservation = jest.fn();
    const handleEdit = jest.fn();

    render(
      React.createElement(GeographicExperiment, {
        experiment,
        onAddObservation: handleAddObservation,
        onEdit: handleEdit,
      })
    );

    expect(screen.getByText('EXP-GEO-001')).toBeInTheDocument();
    expect(screen.getByText('H-MV4-001')).toBeInTheDocument();
    expect(screen.getByText('+133.33%')).toBeInTheDocument();
    expect(screen.getByText('VARIANT_STRONGLY_OUTPERFORMS')).toBeInTheDocument();

    fireEvent.click(screen.getByText('+ Add Observation'));
    expect(handleAddObservation).toHaveBeenCalledWith('EXP-GEO-001');

    fireEvent.click(screen.getByText('Update Metrics'));
    expect(handleEdit).toHaveBeenCalledWith(experiment);
  });

  test('RouteExperiment renders corridor sequence, feasibility, and travel time', () => {
    const route: RouteValidationData = {
      id: 'rt-101',
      origin: 'Raipur',
      destination: 'Jagdalpur',
      intermediate_places: ['Kanker Palace', 'Kondagaon Workshop'],
      estimated_duration_minutes: 360,
      travel_mode: 'CAR',
      feasibility: 'FEASIBLE',
      evidence: 'Smooth NH30 driving with highway tea and craft stops',
      road_condition_score: 4,
      scenic_score: 5,
    };

    const handleValidate = jest.fn();

    render(
      React.createElement(RouteExperiment, {
        route,
        onValidate: handleValidate,
      })
    );

    expect(screen.getByText('FEASIBLE')).toBeInTheDocument();
    expect(screen.getByText('Est. Travel Time: 6h')).toBeInTheDocument();
    expect(screen.getByText('Raipur')).toBeInTheDocument();
    expect(screen.getByText('Kanker Palace')).toBeInTheDocument();
    expect(screen.getByText('Kondagaon Workshop')).toBeInTheDocument();
    expect(screen.getByText('Jagdalpur')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Re-Validate Feasibility'));
    expect(handleValidate).toHaveBeenCalledWith(route);
  });

  test('NearbyPlacesPanel renders nearby places list and expands score breakdown', () => {
    const places: NearbyPlaceItem[] = [
      {
        destination_id: 'DEST_CHITRAKOTE',
        destination_name: 'Chitrakote Falls',
        tourism_type: 'WATERFALL',
        district: 'Bastar',
        distance_km: 38.5,
        travel_time_minutes: 55,
        relationship_type: 'SAME_TRIP_CLUSTER',
        confidence: 0.95,
        geo_relevance_score: 88,
        relevance_breakdown: {
          distance_score: 22,
          travel_time_score: 18,
          route_compatibility: 19,
          experience_compatibility: 14,
          destination_popularity: 9,
          user_interest_match: 6,
        },
      },
    ];

    const handleRadius = jest.fn();
    const handleSelect = jest.fn();

    render(
      React.createElement(NearbyPlacesPanel, {
        sourceDestinationId: 'DEST_JAGDALPUR',
        sourceDestinationName: 'Jagdalpur',
        places,
        radiusKm: 50,
        onRadiusChange: handleRadius,
        onSelectPlace: handleSelect,
      })
    );

    expect(screen.getByText(/Nearby Places from Jagdalpur/)).toBeInTheDocument();
    expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
    expect(screen.getByText('88/100')).toBeInTheDocument();

    // Change radius
    fireEvent.click(screen.getByText('25km'));
    expect(handleRadius).toHaveBeenCalledWith(25);

    // Expand breakdown
    const expandBtn = screen.getByText('Score Breakdown');
    fireEvent.click(expandBtn);
    expect(screen.getByText('22/25')).toBeInTheDocument();
    expect(screen.getByText('18/20')).toBeInTheDocument();

    // Select place
    fireEvent.click(screen.getByText('Select'));
    expect(handleSelect).toHaveBeenCalledWith(places[0]);
  });

  test('GeoValidationMap renders destinations and calls onSelectDestination', () => {
    const destinations: GeoMapPoint[] = [
      { id: 'DEST_JAGDALPUR', name: 'Jagdalpur', district: 'Bastar', latitude: 19.0735, longitude: 82.0289, tourism_type: 'HERITAGE', validation_status: 'VALIDATED' },
      { id: 'DEST_CHITRAKOTE', name: 'Chitrakote Falls', district: 'Bastar', latitude: 19.2017, longitude: 81.7061, tourism_type: 'WATERFALL', validation_status: 'VALIDATED' },
    ];

    const relationships: GeoMapEdge[] = [
      { source: 'DEST_JAGDALPUR', target: 'DEST_CHITRAKOTE', type: 'SAME_TRIP_CLUSTER', status: 'VALIDATED', distance_km: 38.5 },
    ];

    const handleSelect = jest.fn();

    render(
      React.createElement(GeoValidationMap, {
        destinations,
        relationships,
        onSelectDestination: handleSelect,
      })
    );

    expect(screen.getByText('Geographic Relationship Map')).toBeInTheDocument();
    expect(screen.getByText('Jagdalpur')).toBeInTheDocument();
    expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
  });

  test('GeoEvidenceCard renders observation details and confidence', () => {
    const evidence: GeoEvidenceItem = {
      id: 'ev-1',
      task_id: 'TASK-BASTAR-3DAY',
      source_place_id: 'DEST_JAGDALPUR',
      target_place_id: 'DEST_CHITRAKOTE',
      relationship_type: 'SAME_TRIP_CLUSTER',
      observed_behavior: 'Participant planned Chitrakote on day 1 afternoon after seeing 25km proximity suggestion.',
      successful: true,
      difficulty: 1,
      confidence: 0.96,
      evidence_type: 'USER_OBSERVATION',
    };

    render(React.createElement(GeoEvidenceCard, { evidence }));

    expect(screen.getByText('TASK-BASTAR-3DAY')).toBeInTheDocument();
    expect(screen.getByText('Task Succeeded')).toBeInTheDocument();
    expect(screen.getByText('96%')).toBeInTheDocument();
    expect(screen.getByText(/Participant planned Chitrakote/)).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  test('GeographicInsights renders utility score, KPIs and recommendation badge', () => {
    render(
      React.createElement(GeographicInsights, {
        regionId: 'BASTAR',
        regionName: 'Bastar Division',
        overallScore: 4.25,
        decisionRecommendation: 'EXPAND_PILOT',
        activationRate: 0.48,
        routeFeasibilityRate: 0.85,
        discoveryExpansionRate: 2.15,
      })
    );

    expect(screen.getByText('Bastar Division (BASTAR) Spatial Validation')).toBeInTheDocument();
    expect(screen.getByText('4.25 / 5.0')).toBeInTheDocument();
    expect(screen.getByText('EXPAND PILOT')).toBeInTheDocument();
    expect(screen.getByText('48%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('2.15x')).toBeInTheDocument();
    expect(screen.getByText('Nearby Discovery')).toBeInTheDocument();
    expect(screen.getByText('Route Feasibility')).toBeInTheDocument();
  });
});
