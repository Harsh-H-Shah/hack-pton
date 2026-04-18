import catalog from '@/data/actions.json';

export function getAllCategories() {
  return catalog.categories;
}

export function getCategoryById(id) {
  return catalog.categories.find(c => c.id === id) ?? null;
}

export function getActionById(id) {
  for (const cat of catalog.categories) {
    const action = cat.actions.find(a => a.id === id);
    if (action) return { ...action, category: cat.id, categoryEmoji: cat.emoji };
  }
  return null;
}
