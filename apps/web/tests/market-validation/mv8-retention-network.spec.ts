/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { RetentionCohortTable } from '../../src/components/market-validation/RetentionCohortTable';
import { TourismCycleCard } from '../../src/components/market-validation/TourismCycleCard';
import { ReferralFunnel } from '../../src/components/market-validation/ReferralFunnel';
import { ReviewFunnel } from '../../src/components/market-validation/ReviewFunnel';
import { ProviderRetentionCard } from '../../src/components/market-validation/ProviderRetentionCard';
import { CreatorRetentionCard } from '../../src/components/market-validation/CreatorRetentionCard';
import { NetworkEffectCard } from '../../src/components/market-validation/NetworkEffectCard';
import { RetentionInsights } from '../../src/components/market-validation/RetentionInsights';

describe('MV8 Retention & Network Validation Frontend Suite', () => {
  test('RetentionCohortTable renders cohort metrics and trip cycle rates', () => {
    const cohorts = [
      {
        id: 'cohort-1',
        cohort_date: '2026-09-01',
        acquisition_source: 'SEARCH',
        cohort_size: 500,
        d1_rate: 0.35,
        d7_rate: 0.22,
        d30_rate: 0.14,
        trip_cycle_rate: 0.26,
        next_trip_rate: 0.21,
        destination_expansion_rate: 0.4,
      },
    ];

    render(React.createElement(RetentionCohortTable, { cohorts }));
    expect(screen.getByText('Consumer Retention Cohorts')).toBeInTheDocument();
    expect(screen.getByText('SEARCH')).toBeInTheDocument();
    expect(screen.getByText('26.0%')).toBeInTheDocument();
    expect(screen.getByText('21.0%')).toBeInTheDocument();
  });

  test('TourismCycleCard displays lifecycle steps and trip-cycle metrics', () => {
    render(
      React.createElement(TourismCycleCard, {
        tripCycleRetentionRate: 0.255,
        nextTripRate: 0.22,
      })
    );
    expect(screen.getByText('Trip-Cycle Retention Lifecycle')).toBeInTheDocument();
    expect(screen.getByText('25.5%')).toBeInTheDocument();
    expect(screen.getByText('22.0%')).toBeInTheDocument();
    expect(screen.getByText('Destination Research')).toBeInTheDocument();
    expect(screen.getByText('Completed Trip')).toBeInTheDocument();
  });

  test('ReferralFunnel displays viral referral conversion and open rates', () => {
    render(
      React.createElement(ReferralFunnel, {
        metrics: {
          totalShares: 400,
          linksOpened: 280,
          activatedUsers: 110,
          tripsCreatedFromReferral: 45,
          conversions: 24,
          shareOpenRate: 0.7,
          activationRate: 0.393,
          conversionRate: 0.06,
        },
      })
    );
    expect(screen.getByText('Viral Trip Referral Funnel')).toBeInTheDocument();
    expect(screen.getByText(/400/)).toBeInTheDocument();
    expect(screen.getByText('6.0% Referral Conversion')).toBeInTheDocument();
  });

  test('ReviewFunnel displays review loop metrics and downstream bookings', () => {
    render(
      React.createElement(ReviewFunnel, {
        data: {
          totalReviews: 95,
          verifiedPercentage: 0.96,
          totalViews: 4200,
          totalSaves: 610,
          totalBookings: 72,
          conversionRate: 0.017,
        },
      })
    );
    expect(screen.getByText('Review & Content Contribution Loop')).toBeInTheDocument();
    expect(screen.getByText('96% Verified Hosts')).toBeInTheDocument();
    expect(screen.getByText('4,200')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  test('ProviderRetentionCard displays continuation rate and status breakdown', () => {
    render(
      React.createElement(ProviderRetentionCard, {
        metrics: {
          totalOnboarded: 52,
          activeProviders: 44,
          continuationRate: 0.846,
          reactivatedCount: 7,
          avgListingUpdates: 3.8,
          statusDistribution: {
            CONTINUOUS: 37,
            REACTIVATED: 7,
          },
        },
      })
    );
    expect(screen.getByText('Provider Continuation & Reactivation')).toBeInTheDocument();
    expect(screen.getByText('84.6% Active Continuation')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
    expect(screen.getByText('44')).toBeInTheDocument();
  });

  test('CreatorRetentionCard displays creator stories published and influenced trips', () => {
    render(
      React.createElement(CreatorRetentionCard, {
        metrics: {
          totalActiveCreators: 28,
          totalContentPieces: 160,
          totalViews: 82000,
          totalTripsInfluenced: 210,
          creatorContinuationRate: 0.78,
          avgTripsPerCreator: 7.5,
        },
      })
    );
    expect(screen.getByText('Creator Content Engine & Retention')).toBeInTheDocument();
    expect(screen.getByText('78% Retention')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('210')).toBeInTheDocument();
  });

  test('NetworkEffectCard displays cross-side relationships and health score', () => {
    render(
      React.createElement(NetworkEffectCard, {
        data: {
          totalTravelers: 1500,
          activeProviders: 92,
          activeCreators: 28,
          destinationsRepresented: 120,
          totalInteractions: 5400,
          interactionsPerActiveUser: 3.6,
          travelerToProviderEdges: 940,
          travelerToDestinationEdges: 2800,
          travelerToCreatorEdges: 380,
          networkHealthScore: 82.5,
          interpretation: 'ACCELERATING_NETWORK_EFFECTS',
        },
      })
    );
    expect(screen.getByText('Cross-Side Network Effects & Density')).toBeInTheDocument();
    expect(screen.getByText('82.5/100')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('940')).toBeInTheDocument();
  });

  test('RetentionInsights displays seasonality cohorts and failure breakdown', () => {
    render(
      React.createElement(RetentionInsights, {
        failures: [
          { cause: 'USER_COMPLETED_NEED', count: 50, percentage: 38.0 },
          { cause: 'SEASONALITY', count: 32, percentage: 24.0 },
        ],
        seasonality: [
          {
            season_name: 'Dussehra',
            cohort_count: 300,
            trip_cycle_retention_rate: 0.35,
            next_trip_rate: 0.29,
            seasonality_adjustment_factor: 1.25,
          },
        ],
        retentionDecision: 'SUPPORTED',
      })
    );
    expect(screen.getByText('Seasonality Adjusted Cohort Dynamics')).toBeInTheDocument();
    expect(screen.getByText('Decision: SUPPORTED')).toBeInTheDocument();
    expect(screen.getByText('Dussehra')).toBeInTheDocument();
    expect(screen.getByText('USER COMPLETED NEED')).toBeInTheDocument();
  });
});
