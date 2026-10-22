/**
 * Promotion & Coupon Management Engine
 * Provides reusable coupon templates, bulk unique code generation,
 * expiration validation, duplicate prevention, and CSV export.
 * 100% Client-Side, Air-Gapped.
 */

const COUPON_STORAGE_KEY = 'qfh_promotions_coupons';

export const INITIAL_COUPON_TEMPLATES = [
  {
    id: 'coup_tpl_1',
    code: 'WELCOME15',
    description: 'First order discount for new retail customers',
    discountType: 'percentage', // 'percentage' | 'flat'
    discountValue: 15,
    minPurchase: 499,
    validUntil: '2026-12-31',
    maxUses: 500,
    timesRedeemed: 42,
    isActive: true,
  },
  {
    id: 'coup_tpl_2',
    code: 'VIPCLUB20',
    description: 'Exclusive thank you card discount for VIP packaging',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 999,
    validUntil: '2026-12-31',
    maxUses: 200,
    timesRedeemed: 18,
    isActive: true,
  },
  {
    id: 'coup_tpl_3',
    code: 'SAVE100FLAT',
    description: 'Flat ₹100 instant cashback on orders above ₹799',
    discountType: 'flat',
    discountValue: 100,
    minPurchase: 799,
    validUntil: '2026-11-30',
    maxUses: 1000,
    timesRedeemed: 89,
    isActive: true,
  },
];

/**
 * Loads stored coupons or returns initial seed templates.
 */
export function getStoredCoupons() {
  if (typeof localStorage === 'undefined') {
    return INITIAL_COUPON_TEMPLATES;
  }
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(INITIAL_COUPON_TEMPLATES));
      return INITIAL_COUPON_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COUPON_TEMPLATES;
  } catch (err) {
    console.warn('Failed to load coupons from storage:', err);
    return INITIAL_COUPON_TEMPLATES;
  }
}

/**
 * Saves or updates a coupon record.
 */
export function saveCoupon(coupon) {
  const list = getStoredCoupons();
  const cleanCode = (coupon.code || '').trim().toUpperCase();

  if (!cleanCode) {
    throw new Error('Coupon code cannot be empty.');
  }

  // Duplicate check
  const duplicate = list.find((c) => c.code === cleanCode && c.id !== coupon.id);
  if (duplicate) {
    throw new Error(`Coupon code '${cleanCode}' already exists.`);
  }

  const now = new Date().toISOString();
  if (coupon.id) {
    const updated = list.map((c) => (c.id === coupon.id ? { ...c, ...coupon, code: cleanCode, updatedAt: now } : c));
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('qfh:coupons-updated'));
    return coupon.id;
  } else {
    const newId = `coup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCoupon = {
      ...coupon,
      id: newId,
      code: cleanCode,
      timesRedeemed: 0,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newCoupon);
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('qfh:coupons-updated'));
    return newId;
  }
}

/**
 * Deletes a coupon by ID.
 */
export function deleteCoupon(couponId) {
  const list = getStoredCoupons();
  const filtered = list.filter((c) => c.id !== couponId);
  localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('qfh:coupons-updated'));
  return true;
}

/**
 * Validates a coupon code against active criteria.
 */
export function validateCouponCode(code, orderAmount = 0) {
  if (!code || !code.trim()) {
    return { isValid: false, error: 'Coupon code is empty.' };
  }

  const clean = code.trim().toUpperCase();
  const coupons = getStoredCoupons();
  const found = coupons.find((c) => c.code === clean);

  if (!found) {
    return { isValid: false, error: `Coupon '${clean}' was not found in active promotions registry.` };
  }

  if (!found.isActive) {
    return { isValid: false, error: `Coupon '${clean}' is currently deactivated.` };
  }

  if (found.validUntil) {
    const expiry = new Date(found.validUntil + 'T23:59:59');
    if (new Date() > expiry) {
      return { isValid: false, error: `Coupon '${clean}' expired on ${found.validUntil}.` };
    }
  }

  if (found.maxUses && found.timesRedeemed >= found.maxUses) {
    return { isValid: false, error: `Coupon '${clean}' has reached its maximum redemption quota.` };
  }

  if (found.minPurchase && orderAmount > 0 && orderAmount < found.minPurchase) {
    return {
      isValid: false,
      error: `Minimum order value of ₹${found.minPurchase} required for coupon '${clean}'.`,
    };
  }

  let calculatedDiscount = 0;
  if (found.discountType === 'percentage') {
    calculatedDiscount = orderAmount > 0 ? (orderAmount * found.discountValue) / 100 : 0;
  } else {
    calculatedDiscount = found.discountValue;
  }

  return {
    isValid: true,
    coupon: found,
    calculatedDiscount,
    summary: `${found.discountType === 'percentage' ? `${found.discountValue}% OFF` : `₹${found.discountValue} FLAT DISCOUNT`} (Min order: ₹${found.minPurchase || 0})`,
  };
}

/**
 * Bulk generates unique, randomized coupon codes for packaging batches.
 */
export function generateBulkUniqueCoupons({
  prefix = 'GIFT',
  count = 10,
  codeLength = 6,
  discountType = 'percentage',
  discountValue = 10,
  minPurchase = 500,
  validUntil = '2026-12-31',
}) {
  const cleanPrefix = (prefix || 'SAVE').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars (I, O, 0, 1)
  const existingCoupons = getStoredCoupons();
  const existingCodes = new Set(existingCoupons.map((c) => c.code));

  const generatedList = [];

  for (let i = 0; i < count; i++) {
    let uniqueCode = '';
    let attempts = 0;

    while (attempts < 50) {
      attempts++;
      let suffix = '';
      for (let j = 0; j < codeLength; j++) {
        suffix += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      const candidate = `${cleanPrefix}-${suffix}`;
      if (!existingCodes.has(candidate)) {
        uniqueCode = candidate;
        existingCodes.add(candidate);
        break;
      }
    }

    if (uniqueCode) {
      generatedList.push({
        id: `coup_bulk_${Date.now()}_${i}`,
        code: uniqueCode,
        description: `Batch generated ${cleanPrefix} packaging voucher #${i + 1}`,
        discountType,
        discountValue,
        minPurchase,
        validUntil,
        maxUses: 1, // Single-use gift vouchers
        timesRedeemed: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return generatedList;
}

/**
 * Exports coupon list to CSV.
 */
export function exportCouponsToCsv(coupons) {
  const headers = ['Coupon Code', 'Discount Type', 'Discount Value', 'Min Purchase', 'Valid Until', 'Max Uses', 'Times Redeemed', 'Active', 'Description'];
  const rows = coupons.map((c) => [
    `"${c.code}"`,
    c.discountType,
    c.discountValue,
    c.minPurchase || 0,
    c.validUntil || 'N/A',
    c.maxUses || 'Unlimited',
    c.timesRedeemed || 0,
    c.isActive ? 'YES' : 'NO',
    `"${(c.description || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
