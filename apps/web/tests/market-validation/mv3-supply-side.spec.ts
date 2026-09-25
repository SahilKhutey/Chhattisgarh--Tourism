/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { LeadStatus } from '../../src/components/market-validation/LeadStatus';
import { ProviderSegmentFilter } from '../../src/components/market-validation/ProviderSegmentFilter';
import { ProviderTable, ProviderItem } from '../../src/components/market-validation/ProviderTable';
import { ProviderProfile } from '../../src/components/market-validation/ProviderProfile';
import { ProviderOnboarding, OnboardingData } from '../../src/components/market-validation/ProviderOnboarding';
import { ListingCompletion, ListingData } from '../../src/components/market-validation/ListingCompletion';
import { LeadTable, LeadItem } from '../../src/components/market-validation/LeadTable';
import { ProviderValueCard, ProviderMetrics } from '../../src/components/market-validation/ProviderValueCard';
import { SupplyDashboard, FunnelStats } from '../../src/components/market-validation/SupplyDashboard';

describe('MV3 Tourism Supply-Side Validation Suite', () => {
  test('LeadStatus renders status and qualified badge', () => {
    render(React.createElement(LeadStatus, { status: 'BOOKED', qualified: true }));
    expect(screen.getByText('BOOKED')).toBeInTheDocument();
    expect(screen.getByText('★ QUALIFIED')).toBeInTheDocument();
  });

  test('ProviderSegmentFilter triggers change events on segment and geography', () => {
    const handleSegment = jest.fn();
    const handleGeography = jest.fn();

    render(
      React.createElement(ProviderSegmentFilter, {
        selectedSegment: 'ALL',
        selectedGeography: 'ALL',
        onSelectSegment: handleSegment,
        onSelectGeography: handleGeography,
      })
    );

    expect(screen.getByText('Provider Segment')).toBeInTheDocument();
    expect(screen.getByText('Target Geography')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'MICRO_BUSINESS' } });
    expect(handleSegment).toHaveBeenCalledWith('MICRO_BUSINESS');

    fireEvent.change(selects[1], { target: { value: 'BASTAR' } });
    expect(handleGeography).toHaveBeenCalledWith('BASTAR');
  });

  test('ProviderTable renders providers and empty state', () => {
    const providers: ProviderItem[] = [
      {
        id: 'prov-001',
        business_name: 'Bastar Tribal Homestay',
        provider_type: 'HOMESTAY',
        segment: 'MICRO_BUSINESS',
        geography: 'BASTAR',
        operating_area: 'Jagdalpur',
        verification_status: 'VERIFIED',
        digital_presence: 'BASIC_DIGITAL',
        willingness_to_participate: true,
        willingness_to_pay: 'COMMISSION',
        created_at: '2026-09-25T10:00:00Z',
      },
    ];

    const handleSelect = jest.fn();

    render(
      React.createElement(ProviderTable, {
        providers,
        onSelectProvider: handleSelect,
      })
    );

    expect(screen.getByText('Bastar Tribal Homestay')).toBeInTheDocument();
    expect(screen.getByText('HOMESTAY')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();

    const detailsBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(detailsBtn);
    expect(handleSelect).toHaveBeenCalledWith(providers[0]);
  });

  test('ProviderProfile renders details and triggers experiment builder', () => {
    const provider: ProviderItem = {
      id: 'prov-002',
      business_name: 'Mainpat Camp Trails',
      provider_type: 'TOUR_OPERATOR',
      segment: 'SMALL_BUSINESS',
      geography: 'SURGUJA',
      operating_area: 'Mainpat',
      verification_status: 'UNVERIFIED',
      digital_presence: 'SOCIAL_FIRST',
      willingness_to_participate: true,
      willingness_to_pay: 'SUBSCRIPTION',
      created_at: '2026-09-25T10:00:00Z',
    };

    const handleExp = jest.fn();

    render(
      React.createElement(ProviderProfile, {
        provider,
        researchCount: 3,
        onStartExperiment: handleExp,
      })
    );

    expect(screen.getByText('Mainpat Camp Trails')).toBeInTheDocument();
    expect(screen.getByText('3 interviews')).toBeInTheDocument();
    expect(screen.getByText('SUBSCRIPTION')).toBeInTheDocument();

    const expBtn = screen.getByRole('button', { name: /create listing experiment/i });
    fireEvent.click(expBtn);
    expect(handleExp).toHaveBeenCalled();
  });

  test('ProviderOnboarding renders progression and triggers step advance', () => {
    const onboarding: OnboardingData = {
      id: 'onb-01',
      provider_id: 'prov-001',
      current_step: 3,
      status: 'IN_PROGRESS',
      completion_rate: 0.43,
      required_fields_completed: false,
    };

    const handleAdvance = jest.fn();

    render(
      React.createElement(ProviderOnboarding, {
        onboarding,
        onAdvanceStep: handleAdvance,
      })
    );

    expect(screen.getByText(/Step 3 of 7/)).toBeInTheDocument();
    expect(screen.getByText('43%')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next step/i });
    fireEvent.click(nextBtn);
    expect(handleAdvance).toHaveBeenCalledWith(4);
  });

  test('ListingCompletion shows scores and enables publish when valid', () => {
    const validListing: ListingData = {
      id: 'list-01',
      provider_id: 'prov-001',
      template_id: 'HOMESTAY_V1',
      status: 'DRAFT',
      information_score: 80,
      media_score: 80,
      location_score: 90,
      service_score: 85,
      contact_score: 90,
      trust_score: 80,
      listing_quality_score: 84,
    };

    const handlePublish = jest.fn();

    render(
      React.createElement(ListingCompletion, {
        listing: validListing,
        onPublish: handlePublish,
      })
    );

    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText(/All critical criteria satisfied/)).toBeInTheDocument();

    const publishBtn = screen.getByRole('button', { name: /publish listing/i });
    expect(publishBtn).toBeEnabled();
    fireEvent.click(publishBtn);
    expect(handlePublish).toHaveBeenCalledWith('list-01');
  });

  test('LeadTable renders lead items and triggers action buttons', () => {
    const leads: LeadItem[] = [
      {
        id: 'lead-01',
        provider_id: 'prov-001',
        source: 'DISCOVERY',
        traveler_segment: 'ECO_TOURIST',
        destination: 'Bastar',
        experience: 'Tribal Farmstay 3 Nights',
        request_type: 'BOOKING_REQUEST',
        status: 'NEW',
        qualified: false,
        conversion_status: 'PENDING',
        response_time_seconds: 1200,
        created_at: '2026-09-25T10:00:00Z',
      },
    ];

    const handleQualify = jest.fn();
    const handleResponse = jest.fn();

    render(
      React.createElement(LeadTable, {
        leads,
        onQualify: handleQualify,
        onRecordResponse: handleResponse,
      })
    );

    expect(screen.getByText('Tribal Farmstay 3 Nights')).toBeInTheDocument();
    expect(screen.getByText('20m')).toBeInTheDocument();

    const qualifyBtn = screen.getByRole('button', { name: /qualify/i });
    fireEvent.click(qualifyBtn);
    expect(handleQualify).toHaveBeenCalledWith('lead-01');
  });

  test('ProviderValueCard renders economic metrics and conversion rate', () => {
    const metrics: ProviderMetrics = {
      impressions: 450,
      profile_views: 120,
      contacts: 35,
      qualified_leads: 20,
      bookings: 8,
      completed_services: 6,
      estimated_revenue: 36000,
      conversion_rate: 0.4,
      response_time_avg_seconds: 1800,
      perceived_value: 'HIGH',
    };

    render(React.createElement(ProviderValueCard, { metrics }));

    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Bookings (40%)')).toBeInTheDocument();
    expect(screen.getByText('₹36,000')).toBeInTheDocument();
    expect(screen.getByText(/30 mins/)).toBeInTheDocument();
  });

  test('SupplyDashboard displays full funnel steps and economics', () => {
    const funnel: FunnelStats = {
      total_providers: 50,
      onboarded_providers: 35,
      published_listings: 28,
      total_leads: 120,
      qualified_leads: 80,
      bookings: 32,
      onboarding_completion_rate: 0.7,
      lead_qualification_rate: 0.67,
      booking_conversion_rate: 0.4,
    };

    render(
      React.createElement(SupplyDashboard, {
        funnel,
        totalRevenue: 145000,
        avgResponseMins: 25,
      })
    );

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText(/1,45,000|145,000/)).toBeInTheDocument();
    expect(screen.getByText('25 mins')).toBeInTheDocument();
  });
});
