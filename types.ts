
export interface DailyMetric {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface QueryMetric {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PageMetric {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface DeviceMetric {
  device: 'Desktop' | 'Mobile' | 'Tablet';
  clicks: number;
  impressions: number;
}

export interface CountryMetric {
  country: string;
  clicks: number;
  impressions: number;
}

export interface DashboardData {
  timeline: DailyMetric[];
  queries: QueryMetric[];
  pages: PageMetric[];
  devices: DeviceMetric[];
  countries: CountryMetric[];
}

// Ads Types
export interface AdsDailyMetric {
  date: string;
  
  conversions: number;
  previousConversions: number;
  
  impressions: number;
  previousImpressions: number;
  
  clicks: number;
  previousClicks: number;
  
  cost: number;
  previousCost: number;
  
  ctr: number;
  previousCtr: number;
  
  conversionRate: number;
  previousConversionRate: number;
  
  costPerConversion: number;
  previousCostPerConversion: number;
  
  frequency: number;
  previousFrequency: number;
  
  roas: number;
  previousRoas: number;
}

export interface AdsPlatformMetric {
  platform: string;
  cost: number;
  percentage: number;
  color: string;
}

export interface AdsCampaignMetric {
  campaign: string;
  value: number;
}

export interface AdsCountryMetric {
  country: string;
  conversions: number;
  change: number;
}

export interface AdsData {
  overview: {
    impressions: number;
    frequency: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
    amountSpent: number;
    costPerConversion: number;
    cpc: number;
    cpm: number;
  };
  timeline: AdsDailyMetric[];
  platforms: AdsPlatformMetric[];
  campaigns: AdsCampaignMetric[];
  countries: AdsCountryMetric[];
}

// Campaigns / Platforms Types
export interface PlatformDailyMetric {
  date: string;
  facebook: number;
  instagram: number;
  messenger: number;
  unknown: number;
}

export interface PlatformStat {
  platform: string;
  conversions: number;
  conversionPercent: number; // For visualization
  amountSpent: number;
  amountSpentPercent: number; // For visualization
  conversionRate: number;
  cpa: number;
  
  // Changes
  changeConversions: number;
  changeConversionRate: number;
  changeCpa: number;
  changeAmountSpent: number;
}

export interface CampaignsData {
  timeline: PlatformDailyMetric[];
  platformStats: PlatformStat[];
}
