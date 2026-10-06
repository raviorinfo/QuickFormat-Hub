/**
 * Client-Side Local History & Scratchpad Storage
 * Securely persists recent operations in browser localStorage with zero cloud telemetry.
 */

const HISTORY_KEY = 'qfh_scratchpad_history';
const MAX_ENTRIES = 12;

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry({ toolPath, title, preview, data }) {
  try {
    const existing = getHistory();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      toolPath,
      title,
      preview: preview ? preview.slice(0, 160) : '',
      data,
      timestamp: new Date().toLocaleString(),
      timeAgo: 'Just now',
    };

    // Filter duplicates and prepend
    const filtered = existing.filter((item) => item.preview !== entry.preview);
    const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteHistoryEntry(id) {
  try {
    const existing = getHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch {
    return [];
  }
}
