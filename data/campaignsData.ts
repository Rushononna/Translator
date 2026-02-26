import { CampaignsData } from '../types';

// Helper for dates
const getDate = (daysAgo: number) => {
  const date = new Date('2026-01-26'); 
  date.setDate(date.getDate() - daysAgo);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const generatePlatformTimeline = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    // Generate stacked data
    const base = 20;
    const fb = Math.floor(base + Math.random() * 50 + Math.sin(i/3) * 20);
    const insta = Math.floor(base/2 + Math.random() * 30 + Math.cos(i/3) * 10);
    const messenger = Math.floor(Math.random() * 5);
    const unknown = Math.floor(Math.random() * 5);
    
    data.push({
      date: getDate(i),
      facebook: Math.max(0, fb),
      instagram: Math.max(0, insta),
      messenger: messenger,
      unknown: unknown
    });
  }
  return data;
};

export const MOCK_CAMPAIGNS_DATA: CampaignsData = {
  timeline: generatePlatformTimeline(),
  platformStats: [
    {
      platform: 'facebook',
      conversions: 1654,
      conversionPercent: 73.22,
      amountSpent: 312.65,
      amountSpentPercent: 64,
      conversionRate: 80,
      cpa: 0.19,
      changeConversions: -5.6,
      changeConversionRate: 19.4,
      changeCpa: -0.04,
      changeAmountSpent: -23.6
    },
    {
      platform: 'instagram',
      conversions: 596,
      conversionPercent: 26.38,
      amountSpent: 177.63,
      amountSpentPercent: 36,
      conversionRate: 82,
      cpa: 0.30,
      changeConversions: 11.2,
      changeConversionRate: -4.0,
      changeCpa: -0.01,
      changeAmountSpent: 6.5
    },
    {
      platform: 'unknown',
      conversions: 9,
      conversionPercent: 0.4,
      amountSpent: 0,
      amountSpentPercent: 0,
      conversionRate: 0,
      cpa: 0,
      changeConversions: -50.0,
      changeConversionRate: 0,
      changeCpa: 0,
      changeAmountSpent: 0
    },
    {
      platform: 'messenger',
      conversions: 0,
      conversionPercent: 0,
      amountSpent: 0.02,
      amountSpentPercent: 0,
      conversionRate: 0,
      cpa: 0,
      changeConversions: 0,
      changeConversionRate: 0,
      changeCpa: 0,
      changeAmountSpent: 100
    }
  ]
};