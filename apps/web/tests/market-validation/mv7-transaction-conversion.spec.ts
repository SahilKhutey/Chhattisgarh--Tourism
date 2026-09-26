/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ProviderContactCard } from '../../src/components/market-validation/ProviderContactCard';
import { ProviderLeadForm } from '../../src/components/market-validation/ProviderLeadForm';
import { BookingIntentForm } from '../../src/components/market-validation/BookingIntentForm';
import { BookingSummary } from '../../src/components/market-validation/BookingSummary';
import { ProviderResponseStatus } from '../../src/components/market-validation/ProviderResponseStatus';
import { ConversionFunnel } from '../../src/components/market-validation/ConversionFunnel';
import { TransactionStatus } from '../../src/components/market-validation/TransactionStatus';
import { TransactionValueCard } from '../../src/components/market-validation/TransactionValueCard';

describe('MV7 Transaction & Conversion Validation Frontend Suite', () => {
  test('ProviderContactCard renders provider details and triggers contact actions', () => {
    const handleContact = jest.fn();
    const handleBooking = jest.fn();

    render(
      React.createElement(ProviderContactCard, {
        providerId: '12345678-abcd-ef01-2345-6789abcdef01',
        businessName: 'Bastar Tribal Eco Homestay',
        providerType: 'HOMESTAY',
        geography: 'Bastar',
        operatingArea: 'Tokapal',
        responseTimeRating: 'Typically responds in under 15 minutes',
        averageResponseMinutes: 15,
        contactChannels: ['WHATSAPP', 'PHONE'],
        isVerified: true,
        onInitiateContact: handleContact,
        onRequestBooking: handleBooking,
      })
    );

    expect(screen.getByText('Bastar Tribal Eco Homestay')).toBeInTheDocument();
    expect(screen.getByText('Verified Provider')).toBeInTheDocument();
    expect(screen.getByText(/Typically responds in under 15 minutes/)).toBeInTheDocument();

    const whatsappBtn = screen.getByText('Chat on WhatsApp');
    fireEvent.click(whatsappBtn);
    expect(handleContact).toHaveBeenCalledWith('WHATSAPP');

    const bookBtn = screen.getByText('Book Assisted Inquiry');
    fireEvent.click(bookBtn);
    expect(handleBooking).toHaveBeenCalledTimes(1);
  });

  test('ProviderLeadForm captures inquiry fields and submits data', () => {
    const handleSubmit = jest.fn();

    render(
      React.createElement(ProviderLeadForm, {
        providerId: '12345678-abcd-ef01-2345-6789abcdef01',
        destinationName: 'Chitrakote',
        experienceName: 'Waterfall Boat Tour',
        onSubmit: handleSubmit,
      })
    );

    expect(screen.getByText('Inquire with Provider')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Chitrakote')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Waterfall Boat Tour')).toBeInTheDocument();

    const submitBtn = screen.getByText('Send Inquiry');
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  test('BookingIntentForm captures party size, estimated amount and idempotency', () => {
    const handleSubmit = jest.fn();

    render(
      React.createElement(BookingIntentForm, {
        providerId: '12345678-abcd-ef01-2345-6789abcdef01',
        estimatedAmount: 4500,
        onSubmit: handleSubmit,
      })
    );

    expect(screen.getByText('Express Booking Intent')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4500')).toBeInTheDocument();

    const submitBtn = screen.getByText('Submit Booking Intent');
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  test('BookingSummary displays booking reference, GTV and status transitions', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    render(
      React.createElement(BookingSummary, {
        intentId: 'INTENT-987654321',
        status: 'SUBMITTED',
        providerName: 'Dandami Resort Host',
        destination: 'Chitrakote',
        travelDate: '2026-10-15',
        endDate: '2026-10-18',
        partySize: 4,
        estimatedAmount: 7200,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      })
    );

    expect(screen.getByText('INTENT-987654')).toBeInTheDocument();
    expect(screen.getByText('Intent Submitted')).toBeInTheDocument();
    expect(screen.getByText('Dandami Resort Host')).toBeInTheDocument();
    expect(screen.getByText('₹7,200')).toBeInTheDocument();

    const confirmBtn = screen.getByText('Confirm Booking');
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledWith('INTENT-987654321');
  });

  test('ProviderResponseStatus displays SLA turnaround distribution and actions', () => {
    render(
      React.createElement(ProviderResponseStatus, {
        totalLeads: 50,
        respondedLeads: 45,
        averageResponseMinutes: 22,
        slaBuckets: {
          under_5m: 10,
          under_30m: 25,
          under_2h: 7,
          under_24h: 3,
          over_24h: 0,
        },
        responseActions: {
          accept: 30,
          decline: 5,
          question: 6,
          quote: 4,
        },
      })
    );

    expect(screen.getByText('90% Response Rate')).toBeInTheDocument();
    expect(screen.getByText('22 min')).toBeInTheDocument();
    expect(screen.getByText(/Instant/)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('ConversionFunnel renders 7 stages with conversion percentages', () => {
    render(
      React.createElement(ConversionFunnel, {
        overallConversionRate: 3.4,
      })
    );

    expect(screen.getByText('7-Stage Tourism Conversion Funnel')).toBeInTheDocument();
    expect(screen.getByText('3.4%')).toBeInTheDocument();
    expect(screen.getByText('1. Destination Discovery')).toBeInTheDocument();
    expect(screen.getByText('7. Completed Experience')).toBeInTheDocument();
  });

  test('TransactionStatus renders settlement model and complete handler', () => {
    const handleComplete = jest.fn();

    render(
      React.createElement(TransactionStatus, {
        transactionId: 'TX-CG-2026-99998888',
        status: 'IN_PROGRESS',
        amount: 5400,
        providerName: 'Kanger Valley Eco Guide',
        consumerName: 'Aditi Sharma',
        settlementModel: 'DIRECT_TO_PROVIDER',
        experienceDate: '2026-10-12',
        onComplete: handleComplete,
      })
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('₹5,400')).toBeInTheDocument();
    expect(screen.getByText('Kanger Valley Eco Guide')).toBeInTheDocument();

    const completeBtn = screen.getByText('Mark Completed');
    fireEvent.click(completeBtn);
    expect(handleComplete).toHaveBeenCalledWith('TX-CG-2026-99998888');
  });

  test('TransactionValueCard displays GTV facilitated and provider score', () => {
    render(
      React.createElement(TransactionValueCard, {
        metrics: {
          totalGtvFacilitated: 620000,
          completedTransactionsCount: 140,
          averageTransactionValue: 4428,
          providerValueScore: 89.2,
          topDestinationGtv: 'Bastar & Surguja',
          repeatTravelerRate: 21.0,
          averageSatisfaction: 4.9,
        },
      })
    );

    expect(screen.getByText('Gross Tourism Value Facilitated')).toBeInTheDocument();
    expect(screen.getByText('₹6,20,000')).toBeInTheDocument();
    expect(screen.getByText('89.2/100')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('★ 4.9/5.0')).toBeInTheDocument();
  });
});
