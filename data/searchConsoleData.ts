import { DashboardData } from '../types';

// Helper to generate a date string X days ago
const getDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Generate realistic looking timeline data
const generateTimeline = () => {
  const data = [];
  let baseImpressions = 12000;
  let baseClicks = 450;
  
  for (let i = 29; i >= 0; i--) {
    const volatility = Math.random() * 0.4 + 0.8; // Random factor between 0.8 and 1.2
    const weekendDrop = (i % 7 === 0 || i % 7 === 1) ? 0.7 : 1;
    
    const imps = Math.floor(baseImpressions * volatility * weekendDrop);
    const clicks = Math.floor(baseClicks * volatility * weekendDrop * (Math.random() * 0.2 + 0.9));
    
    data.push({
      date: getDate(i),
      impressions: imps,
      clicks: clicks,
      ctr: parseFloat(((clicks / imps) * 100).toFixed(2)),
      position: parseFloat((12 + Math.random() * 4).toFixed(1))
    });
  }
  return data;
};

export const MOCK_DATA: DashboardData = {
  timeline: generateTimeline(),
  queries: [
    { query: "google search console template", clicks: 1205, impressions: 45000, ctr: 2.67, position: 3.2 },
    { query: "looker studio gsc dashboard", clicks: 980, impressions: 12000, ctr: 8.16, position: 1.5 },
    { query: "react dashboard components", clicks: 850, impressions: 32000, ctr: 2.65, position: 8.4 },
    { query: "tailwind css analytics ui", clicks: 620, impressions: 15400, ctr: 4.02, position: 4.1 },
    { query: "data visualization library react", clicks: 430, impressions: 28000, ctr: 1.53, position: 12.6 },
    { query: "nextjs vs react for dashboards", clicks: 390, impressions: 9800, ctr: 3.98, position: 5.2 },
    { query: "how to use recharts", clicks: 310, impressions: 8500, ctr: 3.64, position: 2.8 },
    { query: "free seo reporting tools", clicks: 280, impressions: 42000, ctr: 0.66, position: 18.2 },
    { query: "gemini api examples typescript", clicks: 215, impressions: 3400, ctr: 6.32, position: 1.1 },
    { query: "build analytics app", clicks: 190, impressions: 14000, ctr: 1.35, position: 15.4 },
  ],
  pages: [
    { page: "https://example.com/templates/gsc-dashboard", clicks: 2400, impressions: 85000, ctr: 2.82, position: 4.2 },
    { page: "https://example.com/blog/react-charts-guide", clicks: 1100, impressions: 42000, ctr: 2.61, position: 8.5 },
    { page: "https://example.com/tools/seo-analyzer", clicks: 890, impressions: 28000, ctr: 3.17, position: 6.1 },
    { page: "https://example.com/", clicks: 560, impressions: 12000, ctr: 4.66, position: 1.2 },
    { page: "https://example.com/pricing", clicks: 120, impressions: 3400, ctr: 3.52, position: 9.8 },
    { page: "https://example.com/blog/gemini-integration", clicks: 95, impressions: 2100, ctr: 4.52, position: 3.4 },
  ],
  devices: [
    { device: 'Desktop', clicks: 3500, impressions: 120000 },
    { device: 'Mobile', clicks: 1800, impressions: 65000 },
    { device: 'Tablet', clicks: 150, impressions: 4500 },
  ],
  countries: [
    { country: 'United States', clicks: 2200, impressions: 68000 },
    { country: 'United Kingdom', clicks: 850, impressions: 24000 },
    { country: 'India', clicks: 620, impressions: 35000 },
    { country: 'Germany', clicks: 410, impressions: 12000 },
    { country: 'Canada', clicks: 380, impressions: 11500 },
    { country: 'Australia', clicks: 310, impressions: 9800 },
  ]
};