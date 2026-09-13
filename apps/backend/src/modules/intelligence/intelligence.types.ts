export interface DestinationPerformanceInput {
  views: number;
  saves: number;
  shares: number;
  bookings: number;
  rating: number;
}

export interface DestinationPerformanceResult {
  engagementRate: number;
  conversionRate: number;
  rating: number;
}

export interface DestinationLeaderboardItem {
  id: string;
  name: string;
  district: string;
  views: number;
  saves: number;
  shares: number;
  bookings: number;
  rating: number;
  performance: DestinationPerformanceResult;
}

export interface IntelligenceSummaryResult {
  period: {
    from: string;
    to: string;
  };
  metrics: {
    visitors: number;
    searches: number;
    bookings: number;
    sos: number;
  };
  events: Array<{
    type: string;
    _count: {
      _all: number;
    };
  }>;
}

export interface RegionalDemandItem {
  district: string;
  views: number;
  searches: number;
  bookings: number;
  demandIndex: number;
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SURGING';
}

export interface EmergingDestinationItem {
  placeId: string;
  name: string;
  district: string;
  currentViews: number;
  priorViews: number;
  velocityPercent: number;
}

