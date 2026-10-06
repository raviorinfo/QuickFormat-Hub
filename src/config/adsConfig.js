/**
 * QuickFormat Hub Monetization & Display Ads Configuration
 * Set enabled to true and insert your Google AdSense or Carbon Ads IDs for production.
 */

export const ADS_CONFIG = {
  enabled: false, // Set to true when deploying with active AdSense account
  provider: 'adsense', // 'adsense' | 'carbon' | 'custom'
  adsense: {
    client: 'ca-pub-0000000000000000', // Replace with your AdSense Publisher ID
    slots: {
      topBanner: '1000000001',      // 728x90 Leaderboard
      sidebar: '2000000002',        // 300x250 Medium Rectangle
      bottomBanner: '3000000003',   // 728x90 Responsive
    },
  },
  carbon: {
    placement: 'quickformat-app',
    serve: 'CWYIK27J',
  },
};
