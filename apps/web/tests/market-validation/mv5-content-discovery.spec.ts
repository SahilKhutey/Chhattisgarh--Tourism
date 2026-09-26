/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ContentQualityCard } from '../../src/components/market-validation/ContentQualityCard';
import { ContentTrustCard } from '../../src/components/market-validation/ContentTrustCard';
import { ContentEvidencePanel, EvidenceItemData } from '../../src/components/market-validation/ContentEvidencePanel';
import { ContentExperimentCard, ContentExperimentData } from '../../src/components/market-validation/ContentExperimentCard';
import { ContentVariantViewer, ContentEntryViewerData } from '../../src/components/market-validation/ContentVariantViewer';
import { DiscoveryFunnel, FunnelStepItem } from '../../src/components/market-validation/DiscoveryFunnel';
import { ContentPerformanceTable, ContentPerformanceItem } from '../../src/components/market-validation/ContentPerformanceTable';
import { ContentInsights, ContentInsightsData } from '../../src/components/market-validation/ContentInsights';

describe('MV5 Content & Discovery Validation Frontend Suite', () => {
  test('ContentQualityCard renders quality score and breakdown dimensions', () => {
    const breakdown = {
      completeness: 18,
      accuracy: 14,
      freshness: 10,
      geographic_context: 15,
      practical_utility: 15,
      trust: 12,
      localization: 8,
      total: 92,
    };

    render(
      React.createElement(ContentQualityCard, {
        score: 92,
        breakdown,
        governanceStatus: 'CONTENT_VERIFIED',
      })
    );

    expect(screen.getByText('Content Quality Score')).toBeInTheDocument();
    expect(screen.getByText(/92\.0/)).toBeInTheDocument();
    expect(screen.getByText('CONTENT_VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('Completeness')).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  test('ContentTrustCard renders trust score, source count, and verification details', () => {
    const breakdown = {
      official_source_bonus: 20,
      recent_verification_bonus: 15,
      provider_confirmation_bonus: 15,
      community_confirmation_bonus: 10,
      fresh_media_bonus: 10,
      consistent_sources_bonus: 10,
      contradiction_penalty: 0,
      total_trust_score: 80,
    };

    render(
      React.createElement(ContentTrustCard, {
        trustScore: 82.5,
        sourceCount: 8,
        verifiedSources: 6,
        freshnessScore: 90,
        contradictionCount: 0,
        breakdown,
      })
    );

    expect(screen.getByText('Content Trust Model')).toBeInTheDocument();
    expect(screen.getByText(/82\.5/)).toBeInTheDocument();
    expect(screen.getByText(/Verified Sources/)).toBeInTheDocument();
    expect(screen.getByText(/Total Sources/)).toBeInTheDocument();
    expect(screen.getByText(/Freshness:/)).toBeInTheDocument();
  });

  test('ContentEvidencePanel renders claims and triggers onVerify', () => {
    const onVerify = jest.fn();
    const onAddEvidence = jest.fn();
    const evidenceList: EvidenceItemData[] = [
      {
        id: 'claim-1',
        claim: 'Boating is permitted between 07:00 AM and 05:30 PM.',
        field_name: 'practical.opening_hours',
        source_type: 'GOVERNMENT_OFFICIAL',
        source_reference: 'Order 44/2024 Bastar Collectorate',
        confidence: 0.95,
        status: 'UNVERIFIED',
        verifier: null,
        verified_at: null,
      },
    ];

    render(
      React.createElement(ContentEvidencePanel, {
        evidenceList,
        onVerify,
        onAddEvidence,
      })
    );

    expect(screen.getByText('Content Evidence & Claim Verification')).toBeInTheDocument();
    expect(screen.getByText('Boating is permitted between 07:00 AM and 05:30 PM.')).toBeInTheDocument();
    expect(screen.getByText('GOVERNMENT_OFFICIAL')).toBeInTheDocument();

    const verifyBtn = screen.getByText('Mark Verified');
    fireEvent.click(verifyBtn);
    expect(onVerify).toHaveBeenCalledWith('claim-1');
  });

  test('ContentExperimentCard renders experiment details, lift and primary metric', () => {
    const experiment: ContentExperimentData = {
      id: 'EXP-CONT-001',
      experiment_key: 'EXP-CONT-001',
      name: 'H-MV5-001: Structured Facts vs Narrative Prose',
      hypothesis_key: 'H-MV5-001',
      content_entry_id: 'CE-001',
      status: 'RUNNING',
      control_version: { type: 'narrative' },
      variant_version: { type: 'structured' },
      audience: 'ALL_TRAVELERS',
      primary_metric: 'itinerary_start_rate',
      control_metric_value: 0.1,
      variant_metric_value: 0.18,
      sample_size_control: 1000,
      sample_size_variant: 1000,
      lift_percentage: 80.0,
      outcome: 'VARIANT_OUTPERFORMS',
    };

    render(React.createElement(ContentExperimentCard, { experiment }));

    expect(screen.getByText('H-MV5-001: Structured Facts vs Narrative Prose')).toBeInTheDocument();
    expect(screen.getByText('+80%')).toBeInTheDocument();
    expect(screen.getAllByText(/itinerary_start_rate/).length).toBeGreaterThan(0);
  });

  test('ContentVariantViewer renders overview and tabbed details', () => {
    const content: ContentEntryViewerData = {
      title: 'Chitrakote Falls',
      category: 'WATERFALL',
      short_description: 'The Niagara of India, majestic waterfall on Indravati river.',
      fields_json: {
        practical: {
          opening_hours: '06:00 - 18:30',
          fees: '₹20 / adult',
        },
      },
    };

    render(
      React.createElement(ContentVariantViewer, {
        content,
      })
    );

    expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
    expect(screen.getByText('The Niagara of India, majestic waterfall on Indravati river.')).toBeInTheDocument();
  });

  test('DiscoveryFunnel renders step progression and overall conversion', () => {
    const steps: FunnelStepItem[] = [
      { step: 'Impression', count: 10000, rate: 1.0 },
      { step: 'Open / View', count: 4000, rate: 0.4 },
      { step: 'Itinerary Start', count: 1000, rate: 0.25 },
    ];

    render(
      React.createElement(DiscoveryFunnel, {
        steps,
        overallConversionRate: 0.1,
      })
    );

    expect(screen.getByText('Content-Driven Journey to Trip Itinerary')).toBeInTheDocument();
    expect(screen.getByText(/10,000/)).toBeInTheDocument();
    expect(screen.getByText(/4,000/)).toBeInTheDocument();
    expect(screen.getByText('10.00%')).toBeInTheDocument();
  });

  test('ContentPerformanceTable renders entries and supports cohort filtering', () => {
    const items: ContentPerformanceItem[] = [
      {
        content_id: 'CONT-1',
        title: 'Chitrakote Guide',
        cohort: 'BASTAR_CIRCUIT',
        quality_score: 90,
        impressions: 1000,
        opens: 500,
        engaged_sessions: 300,
        saves: 150,
        shares: 50,
        second_destination_views: 200,
        itinerary_starts: 120,
        planning_activation_rate: 0.24,
        discovery_score: 85.5,
      },
      {
        content_id: 'CONT-2',
        title: 'Mainpat Overview',
        cohort: 'SURGUJA_NORTH',
        quality_score: 75,
        impressions: 800,
        opens: 300,
        engaged_sessions: 150,
        saves: 70,
        shares: 20,
        second_destination_views: 90,
        itinerary_starts: 45,
        planning_activation_rate: 0.15,
        discovery_score: 68.0,
      },
    ];

    render(React.createElement(ContentPerformanceTable, { items }));

    expect(screen.getByText('Content Performance Matrix')).toBeInTheDocument();
    expect(screen.getByText('Chitrakote Guide')).toBeInTheDocument();
    expect(screen.getByText('Mainpat Overview')).toBeInTheDocument();
  });

  test('ContentInsights renders synthesis KPIs and strategic lift highlights', () => {
    const insightsData: ContentInsightsData = {
      total_entries: 30,
      avg_quality_score: 80.5,
      avg_discovery_score: 74.2,
      total_impressions: 50000,
      total_opens: 20000,
      total_itinerary_starts: 4400,
      overall_planning_conversion_rate: 0.22,
      high_vs_low_quality_lift_multiplier: 3.5,
      top_discovery_source: 'THEMATIC_SEARCH',
      verified_claims_percentage: 86.0,
    };

    render(React.createElement(ContentInsights, { data: insightsData }));

    expect(screen.getByText('Content & Discovery Strategic Insights')).toBeInTheDocument();
    expect(screen.getByText('74.2')).toBeInTheDocument();
    expect(screen.getByText('22.0%')).toBeInTheDocument();
    expect(screen.getByText('3.5x')).toBeInTheDocument();
    expect(screen.getByText('86.0%')).toBeInTheDocument();
  });
});
