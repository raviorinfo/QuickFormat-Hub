/**
 * Saved Designs & Project Management Utilities
 * Allows saving, reopening, duplicating, renaming, and deleting designs
 * across all Commerce tools with client-side localStorage persistence.
 */

const STORAGE_KEY = 'qfh_saved_designs';

export function getSavedDesigns(toolFilter = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (toolFilter) {
      return list.filter((item) => item.tool === toolFilter);
    }
    return list;
  } catch (err) {
    console.warn('Failed to load saved designs from localStorage:', err);
    return [];
  }
}

export function saveDesign({ id = null, tool, name, state, previewDataUrl = null }) {
  try {
    const existingList = getSavedDesigns();
    const now = new Date().toISOString();

    if (id) {
      // Update existing
      const updatedList = existingList.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            name: name || item.name,
            state: state || item.state,
            previewDataUrl: previewDataUrl !== undefined ? previewDataUrl : item.previewDataUrl,
            updatedAt: now,
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('qfh:saved-designs-updated'));
      return id;
    } else {
      // Create new
      const newId = `des_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newDesign = {
        id: newId,
        tool,
        name: name || `Untitled ${tool} (${new Date().toLocaleDateString()})`,
        state,
        previewDataUrl,
        createdAt: now,
        updatedAt: now,
      };
      existingList.unshift(newDesign);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingList));
      window.dispatchEvent(new CustomEvent('qfh:saved-designs-updated'));
      return newId;
    }
  } catch (err) {
    console.error('Failed to save design:', err);
    throw err;
  }
}

export function duplicateDesign(id) {
  try {
    const list = getSavedDesigns();
    const target = list.find((item) => item.id === id);
    if (!target) return null;

    const newId = `des_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const copy = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(copy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('qfh:saved-designs-updated'));
    return newId;
  } catch (err) {
    console.error('Failed to duplicate design:', err);
    return null;
  }
}

export function renameDesign(id, newName) {
  try {
    const list = getSavedDesigns();
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name: newName.trim() || item.name,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('qfh:saved-designs-updated'));
    return true;
  } catch (err) {
    console.error('Failed to rename design:', err);
    return false;
  }
}

export function deleteDesign(id) {
  try {
    const list = getSavedDesigns();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('qfh:saved-designs-updated'));
    return true;
  } catch (err) {
    console.error('Failed to delete design:', err);
    return false;
  }
}

export function getDesignById(id) {
  const list = getSavedDesigns();
  return list.find((item) => item.id === id) || null;
}
