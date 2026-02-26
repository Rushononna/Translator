
import { AdsData } from '../types';

// Helper for dates
const getDate = (daysAgo: number) => {
  const date = new Date('2026-01-25'); // Anchored to screenshot date somewhat
  date.setDate(date.getDate() - daysAgo);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const generateAdsTimeline = () => {
  const data = [];
  for (let i = 59; i >= 0; i--) { // Increased to 60 days to allow better monthly drilling
    // Base volatility
    const wave = Math.sin(i / 3); 
    const noise = () => Math.random() * 0.2 - 0.1;

    // --- Current Period Metrics ---
    // Conversions: Base ~70, highly correlated with wave
    const conversions = Math.max(20, Math.floor(70 + wave * 30 + Math.random() * 20));
    
    // Impressions: Base ~4000, loosely correlated
    const impressions = Math.max(1000, Math.floor(4000 + wave * 1000 + Math.random() * 1000));
    
    // Clicks: ~1-3% of impressions
    const ctrRaw = 0.02 + noise() * 0.005;
    const clicks = Math.floor(impressions * ctrRaw);
    
    // Cost: Base ~0.5 per click
    const cpcRaw = 0.5 + noise() * 0.1;
    const cost = parseFloat((clicks * cpcRaw).toFixed(2));
    
    const ctr = parseFloat((ctrRaw * 100).toFixed(2));
    const conversionRate = clicks > 0 ? parseFloat(((conversions / clicks) * 100).toFixed(2)) : 0;
    const costPerConversion = conversions > 0 ? parseFloat((cost / conversions).toFixed(2)) : 0;
    const frequency = parseFloat((1.1 + Math.random() * 0.4).toFixed(2));
    const roas = parseFloat((2 + Math.random() * 3).toFixed(2));


    // --- Previous Period Metrics (Mocking a shift) ---
    const prevWave = Math.sin((i + 7) / 3); // Phase shift
    const prevNoise = () => Math.random() * 0.2 - 0.1;

    const previousConversions = Math.max(20, Math.floor(70 + prevWave * 30 + Math.random() * 20));
    const previousImpressions = Math.max(1000, Math.floor(4000 + prevWave * 1000 + Math.random() * 1000));
    
    const prevCtrRaw = 0.02 + prevNoise() * 0.005;
    const previousClicks = Math.floor(previousImpressions * prevCtrRaw);
    
    const prevCpcRaw = 0.5 + prevNoise() * 0.1;
    const previousCost = parseFloat((previousClicks * prevCpcRaw).toFixed(2));

    const previousCtr = parseFloat((prevCtrRaw * 100).toFixed(2));
    const previousConversionRate = previousClicks > 0 ? parseFloat(((previousConversions / previousClicks) * 100).toFixed(2)) : 0;
    const previousCostPerConversion = previousConversions > 0 ? parseFloat((previousCost / previousConversions).toFixed(2)) : 0;
    const previousFrequency = parseFloat((1.1 + Math.random() * 0.4).toFixed(2));
    const previousRoas = parseFloat((2 + Math.random() * 3).toFixed(2));

    data.push({
      date: getDate(i),
      // Current
      conversions,
      impressions,
      clicks,
      cost,
      ctr,
      conversionRate,
      costPerConversion,
      frequency,
      roas,
      // Previous
      previousConversions,
      previousImpressions,
      previousClicks,
      previousCost,
      previousCtr,
      previousConversionRate,
      previousCostPerConversion,
      previousFrequency,
      previousRoas
    });
  }
  return data;
};

export const MOCK_ADS_DATA: AdsData = {
  overview: {
    impressions: 110273,
    frequency: 2.62,
    clicks: 1396,
    ctr: 2.58,
    conversions: 2257,
    conversionRate: 80.87,
    amountSpent: 245,
    costPerConversion: 0.22,
    cpc: 0.06,
    cpm: 2.10
  },
  timeline: generateAdsTimeline(),
  platforms: [
    { platform: 'Instagram', cost: 156.31, percentage: 63.8, color: '#3b82f6' },
    { platform: 'Facebook', cost: 88.69, percentage: 36.2, color: '#0ea5e9' },
  ],
  campaigns: [
    { campaign: 'Sales_Campaign_View-Content_Sellers_July-Aug', value: 1205 },
    { campaign: 'Engagement_Campaign__Buyers_July-Aug-2025', value: 1049 },
    { campaign: 'Test Campaign - Conversation', value: 0 },
  ],
  countries: [
    { country: 'GR', conversions: 2250, change: -1.0 },
    { country: 'unknown', conversions: 9, change: -47.1 },
    { country: 'BR', conversions: 0, change: 0 },
  ]
};
