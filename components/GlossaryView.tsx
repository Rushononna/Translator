import React from 'react';

const glossaryData = [
  { id: 1, field: 'Ad Name', source: 'Facebook Ads', type: 'Text', description: 'The name of the individual ad.', formula: '-' },
  { id: 2, field: 'Adset Name', source: 'Facebook Ads', type: 'Text', description: 'The name of the ad set within the campaign.', formula: '-' },
  { id: 3, field: 'Age', source: 'Facebook Ads', type: 'Text', description: 'The age range of the individuals who viewed the ad.', formula: '-' },
  { id: 4, field: 'Amount Spent', source: 'Facebook Ads', type: 'Number', description: 'The total amount of money spent on the campaign during a given period.', formula: '-' },
  { id: 5, field: 'CPC', source: 'Facebook Ads', type: 'Number', description: 'The average cost per link click.', formula: '-' },
  { id: 6, field: 'CPM', source: 'Facebook Ads', type: 'Number', description: 'Cost per 1,000 impressions.', formula: '-' },
  { id: 7, field: 'CTR (Link Clicks)', source: 'Facebook Ads', type: 'Percent', description: 'The click-through rate for links in the ad, calculated as (Link Clicks / Impressions) * 100.', formula: '(Link Clicks / Impressions) * 100' },
  { id: 8, field: 'Campaign Name', source: 'Facebook Ads', type: 'Text', description: 'The name of the advertising campaign.', formula: '-' },
  { id: 9, field: 'Cost Per Result', source: 'Facebook Ads', type: 'Number', description: 'The average cost per result.', formula: '(SUM(Amount Spent) / SUM(Results))' },
  { id: 10, field: 'Country', source: 'Facebook Ads', type: 'Text', description: 'The country from which the ad was viewed.', formula: '-' },
  { id: 11, field: 'Date', source: 'Facebook Ads', type: 'Date', description: 'The date when the data was recorded.', formula: '-' },
  { id: 12, field: 'Device Platform', source: 'Facebook Ads', type: 'Text', description: 'The type of device on which the ad was viewed (desktop, mobile app, mobile web).', formula: '-' },
  { id: 13, field: 'Frequency', source: 'Facebook Ads', type: 'Number', description: 'The average number of times each user sees your ad.', formula: '-' },
  { id: 14, field: 'Gender', source: 'Facebook Ads', type: 'Text', description: 'The gender of the individuals who viewed the ad.', formula: '-' },
  { id: 15, field: 'Impressions', source: 'Facebook Ads', type: 'Number', description: 'The total number of times ads were on screen.', formula: '-' },
  { id: 16, field: 'Link Clicks', source: 'Facebook Ads', type: 'Number', description: 'The number of clicks on links within the ad that lead to advertiser-defined destinations.', formula: '-' },
  { id: 17, field: 'Publisher Platform', source: 'Facebook Ads', type: 'Text', description: 'The platform where the ad was published (e.g., Facebook, Instagram, Messenger).', formula: '-' },
  { id: 18, field: 'Region', source: 'Facebook Ads', type: 'Text', description: 'The region within the country from which the ad was viewed.', formula: '-' },
  { id: 19, field: 'Result Rate %', source: 'Facebook Ads', type: 'Percent', description: 'The rate of results relative to the number of link clicks.', formula: '(SUM(Results) / SUM(Link Clicks)) * 100' },
  { id: 20, field: 'Results', source: 'Facebook Ads', type: 'Parameter', description: 'The outcomes achieved from your ad (e.g., Purchases, Leads, Subscriptions).', formula: '-' },
];

export const GlossaryView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Report Glossary</h1>
        <p className="text-gray-500">Definitions and formulas for metrics used in this dashboard.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Field</th>
                <th className="px-6 py-4">Data Source</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 w-1/3">Description</th>
                <th className="px-6 py-4">Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {glossaryData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{item.id}.</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{item.field}</td>
                  <td className="px-6 py-4 text-gray-600">{item.source}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.type === 'Number' ? 'bg-blue-100 text-blue-800' : 
                        item.type === 'Text' ? 'bg-gray-100 text-gray-800' : 
                        item.type === 'Percent' ? 'bg-green-100 text-green-800' :
                        item.type === 'Date' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 leading-relaxed">{item.description}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};