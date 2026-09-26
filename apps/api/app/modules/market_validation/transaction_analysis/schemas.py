from __future__ import annotations

from pydantic import BaseModel


class LeadsAnalysisResponse(BaseModel):
    total_leads: int
    qualified_leads: int
    disqualified_leads: int
    pending_leads: int
    qualification_rate: float
    disqualification_reasons_breakdown: dict[str, int]
    sources_breakdown: dict[str, int]


class ProviderResponseAnalysis(BaseModel):
    total_requests: int
    total_responded: int
    response_rate: float
    median_response_time_seconds: int
    p75_response_time_seconds: int
    p95_response_time_seconds: int
    sla_buckets: dict[str, int]  # "<5m", "5-30m", "30-120m", "2-24h", ">24h"
    response_types_breakdown: dict[str, int]  # ACCEPT, DECLINE, QUESTION, QUOTE


class BookingAnalysis(BaseModel):
    total_intents: int
    confirmed_intents: int
    cancelled_intents: int
    booking_intent_conversion_rate: float
    average_party_size: float
    average_estimated_amount: float
    cancellation_reasons_breakdown: dict[str, int]


class CompletionAnalysis(BaseModel):
    total_bookings: int
    completed_experiences: int
    no_shows: int
    cancellations: int
    disputed: int
    completion_rate: float
    failure_reasons_breakdown: dict[str, int]
    consumer_confirmed_count: int
    provider_confirmed_count: int


class EconomicValueAnalysis(BaseModel):
    gross_tourism_value_facilitated: float  # completed bookings * transaction value
    completed_bookings_count: int
    estimated_booking_value: float
    qualified_lead_value: float
    estimated_local_spend: float  # multiplier of direct booking
    provider_reported_revenue: float
    platform_facilitated_ratio: float
    currency: str = "INR"


class ProviderValueAnalysis(BaseModel):
    overall_provider_value_score: float  # 0 to 100
    lead_quality_score: float  # 0 to 100
    response_success_rate: float  # 0 to 1
    booking_conversion_rate: float  # 0 to 1
    economic_value_score: float  # 0 to 100
    continuation_intent_rate: float  # 0 to 1
    active_providers_count: int
    continuation_willing_providers_count: int
