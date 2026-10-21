export const CARD_SIZES = [
  { id: 'business-card', label: 'Business Card Insert (3.5" × 2" / 89 × 51 mm)', widthMm: 89, heightMm: 51, a4Cols: 2, a4Rows: 5 },
  { id: 'a6-postcard', label: 'A6 Postcard Insert (5.8" × 4.1" / 148 × 105 mm)', widthMm: 148, heightMm: 105, a4Cols: 1, a4Rows: 2 },
  { id: 'square-insert', label: 'Square Package Slip (4" × 4" / 102 × 102 mm)', widthMm: 102, heightMm: 102, a4Cols: 2, a4Rows: 2 },
  { id: 'a5-card', label: 'A5 Large Note Card (8.3" × 5.8" / 210 × 148 mm)', widthMm: 210, heightMm: 148, a4Cols: 1, a4Rows: 1 },
];

export const THANK_YOU_TEMPLATES = [
  {
    id: 'minimal-modern',
    label: 'Minimalist Modern',
    theme: {
      bg: '#ffffff',
      textColor: '#0f172a',
      subTextColor: '#475569',
      accentColor: '#0284c7',
      borderColor: '#e2e8f0',
      couponBg: '#f8fafc',
      couponBorder: '#cbd5e1',
      font: 'sans-serif',
    },
    defaultFront: {
      brandName: 'STUDIO ESSENTIALS',
      headline: 'Thank You For Your Order!',
      message: 'Every time you choose to support our small brand, a real creator does a happy dance. We hope this package brings warmth and joy to your doorstep.',
      couponCode: 'THANKYOU10',
      couponText: 'Enjoy 10% off your next purchase with code',
      website: 'www.studioessentials.com',
      social: '@studioessentials',
      showQr: true,
      qrUrl: 'https://studioessentials.com',
    },
    defaultBack: {
      headline: 'A Few Ways to Stay Connected',
      message: '1. Follow us on Instagram for weekly launches.\n2. Tag #StudioEssentials to be featured.\n3. Have questions? Reach out to support@studioessentials.com anytime!',
      footnote: 'Handcrafted with care & sustainably packaged.',
    },
  },
  {
    id: 'luxury-gold',
    label: 'Luxury Charcoal & Gold',
    theme: {
      bg: '#09090b',
      textColor: '#fef08a',
      subTextColor: '#d4d4d8',
      accentColor: '#eab308',
      borderColor: '#ca8a04',
      couponBg: '#18181b',
      couponBorder: '#eab308',
      font: 'serif',
    },
    defaultFront: {
      brandName: 'MAISON DE LUXE',
      headline: 'A Heartfelt Thank You',
      message: 'Thank you for choosing Maison De Luxe. Your appreciation for fine craftsmanship and timeless aesthetics inspires everything we create.',
      couponCode: 'VIP15',
      couponText: 'Exclusive 15% VIP discount on your next acquisition',
      website: 'www.maisondeluxe.com',
      social: '@maisondeluxe',
      showQr: true,
      qrUrl: 'https://maisondeluxe.com/vip',
    },
    defaultBack: {
      headline: 'Care & Authenticity',
      message: 'Each item is individually inspected and guaranteed authentic. Store in a cool, dry place away from direct moisture.',
      footnote: 'Excellence in every detail.',
    },
  },
  {
    id: 'kraft-artisan',
    label: 'Warm Kraft Artisan',
    theme: {
      bg: '#f5ebe0',
      textColor: '#4a3525',
      subTextColor: '#6b4f3b',
      accentColor: '#8c5836',
      borderColor: '#d5bdaf',
      couponBg: '#ede0d4',
      couponBorder: '#b08968',
      font: 'serif',
    },
    defaultFront: {
      brandName: 'THE ARTISAN PANTRY',
      headline: 'Handmade Just For You',
      message: 'Thank you for supporting authentic handmade craft! Our small team poured love, patience, and meticulous attention into crafting your order.',
      couponCode: 'CRAFT10',
      couponText: 'Use coupon for 10% off your next jar or gift set',
      website: 'www.theartisanpantry.com',
      social: '@theartisanpantry',
      showQr: true,
      qrUrl: 'https://theartisanpantry.com',
    },
    defaultBack: {
      headline: 'Naturally Sourced & Sustainable',
      message: 'Our packaging is 100% recyclable, biodegradable, and zero-plastic. Thank you for protecting the planet alongside us.',
      footnote: 'Made with love & organic ingredients.',
    },
  },
  {
    id: 'pastel-boutique',
    label: 'Pastel Blush Boutique',
    theme: {
      bg: '#fff1f2',
      textColor: '#881337',
      subTextColor: '#9f1239',
      accentColor: '#e11d48',
      borderColor: '#fecdd3',
      couponBg: '#ffe4e6',
      couponBorder: '#fda4af',
      font: 'serif',
    },
    defaultFront: {
      brandName: 'BLUSH & BLOOM',
      headline: "You've Got Great Taste!",
      message: 'Thank you for trusting Blush & Bloom with your style journey. We know you will look absolutely radiant in your new pieces.',
      couponCode: 'SWEET15',
      couponText: 'Take 15% off your next boutique haul',
      website: 'www.blushandbloom.com',
      social: '@blushandbloom',
      showQr: true,
      qrUrl: 'https://blushandbloom.com',
    },
    defaultBack: {
      headline: 'Snap & Tag to Win!',
      message: 'Post a selfie wearing your new look, tag @blushandbloom, and you will be automatically entered into our monthly $100 gift card giveaway.',
      footnote: 'Styled with elegance, just for you.',
    },
  },
  {
    id: 'festive-celebration',
    label: 'Festive & Celebration',
    theme: {
      bg: '#1e1b4b',
      textColor: '#fef08a',
      subTextColor: '#e0e7ff',
      accentColor: '#f59e0b',
      borderColor: '#6366f1',
      couponBg: '#312e81',
      couponBorder: '#f59e0b',
      font: 'sans-serif',
    },
    defaultFront: {
      brandName: 'CELEBRATION LAB',
      headline: 'Warmest Festive Wishes!',
      message: 'Thank you for letting us be part of your joyous celebrations! May this season be filled with laughter, cheer, and treasured memories with loved ones.',
      couponCode: 'HOLIDAY20',
      couponText: 'Celebrate more! Take 20% off with promo code',
      website: 'www.celebrationlab.com',
      social: '@celebrationlab',
      showQr: true,
      qrUrl: 'https://celebrationlab.com/festive',
    },
    defaultBack: {
      headline: 'Wishing You Happy Holidays',
      message: 'Thank you for making our year so extraordinary. Here’s to many more bright beginnings and shared festivities together.',
      footnote: 'Celebrate every moment.',
    },
  },
  {
    id: 'ecommerce-insert',
    label: 'E-Commerce Package Insert',
    theme: {
      bg: '#ffffff',
      textColor: '#1e293b',
      subTextColor: '#475569',
      accentColor: '#10b981',
      borderColor: '#e2e8f0',
      couponBg: '#ecfdf5',
      couponBorder: '#a7f3d0',
      font: 'sans-serif',
    },
    defaultFront: {
      brandName: 'QUICKSHIP DIRECT',
      headline: 'Your Package Has Arrived!',
      message: 'Thank you for shopping with us! We take tremendous pride in fast delivery and pristine quality. Inspect your items and let us know how we did.',
      couponCode: 'REORDER15',
      couponText: 'Scan the QR code to reorder with 15% discount',
      website: 'www.quickshipdirect.com',
      social: '@quickshipdirect',
      showQr: true,
      qrUrl: 'https://quickshipdirect.com/reorder',
    },
    defaultBack: {
      headline: 'Hassle-Free Returns & Support',
      message: 'Not 100% in love with your item? No worries! Visit our returns portal within 30 days for an instant prepaid return label.\nEmail: support@quickshipdirect.com',
      footnote: '100% Satisfaction Guarantee.',
    },
  },
  {
    id: 'eco-botanical',
    label: 'Eco Botanical & Sage',
    theme: {
      bg: '#f0fdf4',
      textColor: '#14532d',
      subTextColor: '#166534',
      accentColor: '#15803d',
      borderColor: '#bbf7d0',
      couponBg: '#dcfce7',
      couponBorder: '#86efac',
      font: 'serif',
    },
    defaultFront: {
      brandName: 'EARTH & ROOTS',
      headline: 'Grown & Crafted With Respect',
      message: 'Thank you for choosing cruelty-free, sustainable living! A portion of proceeds from this order is planted as native trees in deforested areas.',
      couponCode: 'GREEN10',
      couponText: 'Save 10% on your next eco-friendly refill',
      website: 'www.earthandroots.org',
      social: '@earthandroots',
      showQr: true,
      qrUrl: 'https://earthandroots.org',
    },
    defaultBack: {
      headline: 'Our Circular Promise',
      message: 'This entire card is printed on 100% post-consumer recycled seed paper. Bury under 1cm of soil, water regularly, and watch wild daisies sprout!',
      footnote: 'Plant this card & watch it grow.',
    },
  },
];

export const MESSAGE_SUGGESTIONS = [
  {
    category: 'Customer Appreciation',
    items: [
      {
        title: 'Happy Dance (Small Business)',
        headline: 'Thank You For Your Order!',
        message: 'Every time you choose to support a small business, a real person does a happy dance! Thank you for backing independent dreams.',
      },
      {
        title: 'You Made Our Day',
        headline: 'You Made Our Entire Day!',
        message: 'We are so grateful for your purchase. We put our whole hearts into packaging this order and hope you love it as much as we loved making it.',
      },
      {
        title: 'Personal Gratitude',
        headline: 'A Sincere Thank You',
        message: 'From the bottom of our hearts, thank you for your trust and support. Customers like you make everything we do worthwhile.',
      },
    ],
  },
  {
    category: 'Repeat Purchases & Offers',
    items: [
      {
        title: 'Exclusive Repeat Coupon',
        headline: 'A Treat For Your Next Visit!',
        message: 'We appreciate your loyalty! As a small token of gratitude, please enjoy an exclusive discount code on your next purchase.',
      },
      {
        title: 'Friend Referral',
        headline: 'Share the Love With Friends',
        message: 'Love what you received? Share your unique discount code with a friend and you will both receive $10 off your next orders.',
      },
    ],
  },
  {
    category: 'Reviews & Feedback',
    items: [
      {
        title: 'Loved Your Order?',
        headline: 'How Did We Do?',
        message: 'Your feedback means the world to our small team. If you have 60 seconds, scanning the QR code to leave a quick review would truly help us grow!',
      },
      {
        title: 'Social Shoutout',
        headline: 'Show Off Your Style!',
        message: 'Snap an unboxing photo or video, tag us on Instagram or TikTok, and get featured on our official brand page!',
      },
    ],
  },
  {
    category: 'Festive & Seasonal',
    items: [
      {
        title: 'Holiday Cheer',
        headline: 'Wishing You Happy Holidays!',
        message: 'May this holiday season bring you and your family immense happiness, peace, and warmth. Thank you for celebrating with us!',
      },
      {
        title: 'New Year Gratitude',
        headline: 'Cheers to New Beginnings!',
        message: 'Thank you for standing by us this year. We wish you thrilling adventures, health, and prosperity in the months ahead.',
      },
    ],
  },
];

export const PRIVACY_SAFEGUARDS_NOTICE =
  'All customer personalization data is processed 100% locally in your browser memory. No customer names, order IDs, or private records are ever uploaded or transmitted to any server.';

/**
 * Calculates print dimensions including 3mm bleed margin and safe-zone inset.
 */
export function getCardPrintDimensions(widthMm, heightMm, bleedMm = 3) {
  const safeZoneMm = 5;
  return {
    trimWidthMm: widthMm,
    trimHeightMm: heightMm,
    bleedMm,
    totalWidthMm: widthMm + bleedMm * 2,
    totalHeightMm: heightMm + bleedMm * 2,
    safeZoneMm,
    safeWidthMm: Math.max(10, widthMm - safeZoneMm * 2),
    safeHeightMm: Math.max(10, heightMm - safeZoneMm * 2),
  };
}

/**
 * Generates sample CSV for bulk customer thank-you card personalization.
 */
export function generateCardPersonalizationSampleCsv() {
  return [
    'Customer Name,Order ID,Special Note,Coupon Code',
    'Priya Sharma,#QF-10821,Thank you for ordering our artisan honey!,SWEET15',
    'Rahul Verma,#QF-10822,Your custom leather journal is ready to ship.,JOURNAL10',
    'Ananya Iyer,#QF-10823,Hope you adore your handcrafted silver earrings!,SILVER20',
    'Vikram Malhotra,#QF-10824,Thanks for supporting our independent workshop!,VIP25',
  ].join('\n');
}

/**
 * Parses CSV text for customer personalization batch cards.
 */
export function parseCardPersonalizationCsv(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('customer') ||
    firstLine.includes('name') ||
    firstLine.includes('order') ||
    firstLine.includes('coupon');

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    const parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

    const customerName = parts[0] || `Customer ${idx + 1}`;
    const orderId = parts[1] || `#ORD-${1000 + idx}`;
    const specialNote = parts[2] || '';
    const couponCode = parts[3] || '';

    return {
      id: `cust-${idx}`,
      customerName,
      orderId,
      specialNote,
      couponCode,
      isValid: Boolean(customerName),
    };
  });
}

