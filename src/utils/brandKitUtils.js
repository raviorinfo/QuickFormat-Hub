/**
 * Shared Brand Kit Utilities
 * Allows business branding (name, logo, colors, fonts, contacts, UPI)
 * to be saved once and applied seamlessly across all Commerce & Product tools.
 */

const STORAGE_KEY = 'qfh_brand_kit';

export const DEFAULT_BRAND_KIT = {
  brandName: 'Acme Retail & Goods',
  tagline: 'Premium Handcrafted Quality',
  logoUrl: null,
  primaryColor: '#0284c7', // Brand accent
  secondaryColor: '#0f172a', // Dark neutral
  fontFamily: 'sans-serif',
  website: 'https://acmeretail.com',
  social: '@acmeretail',
  supportEmail: 'support@acmeretail.com',
  phone: '+91 98765 43210',
  upiId: 'acmeretail@okhdfcbank',
  currency: 'INR',
  updatedAt: new Date().toISOString(),
};

export function getSavedBrandKit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRAND_KIT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BRAND_KIT, ...parsed };
  } catch (err) {
    console.warn('Failed to load Brand Kit from localStorage:', err);
    return DEFAULT_BRAND_KIT;
  }
}

export function saveBrandKit(kit) {
  try {
    const payload = {
      ...DEFAULT_BRAND_KIT,
      ...kit,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Dispatch custom event for real-time listener updates
    window.dispatchEvent(new CustomEvent('qfh:brand-kit-updated', { detail: payload }));
    return payload;
  } catch (err) {
    console.error('Failed to save Brand Kit to localStorage:', err);
    throw err;
  }
}

export function resetBrandKit() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('qfh:brand-kit-updated', { detail: DEFAULT_BRAND_KIT }));
    return DEFAULT_BRAND_KIT;
  } catch (err) {
    console.error('Failed to reset Brand Kit:', err);
    return DEFAULT_BRAND_KIT;
  }
}
