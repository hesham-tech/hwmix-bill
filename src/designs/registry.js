export const designDefinitions = Object.freeze({
  classic: {
    id: 'classic', label: 'التصميم الحالي',
    load: () => {
      // Font hints are optional: their failure must never block the selected design.
      import('./classic/fontPreload').then(module => module.preloadFonts()).catch(() => undefined);
      return import('./classic');
    },
  },
});

export function designScope(user) {
  return user?.id && user?.active_company_id ? `${user.id}:${user.active_company_id}` : 'guest';
}

export function getSelectedDesign(user, storage = localStorage, definitions = designDefinitions) {
  try {
    const id = storage.getItem(`hwnix:design:${designScope(user)}`);
    return Object.hasOwn(definitions, id) ? id : 'classic';
  } catch { return 'classic'; }
}

export function saveSelectedDesign(id, user, storage = localStorage) {
  if (!Object.hasOwn(designDefinitions, id)) throw new Error('Unknown design');
  storage.setItem(`hwnix:design:${designScope(user)}`, id);
}

export function getStoredDesignUser() {
  try { return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

export function createDesignLoader(definitions = designDefinitions) {
  const loaded = new Map();
  return (id = 'classic') => {
    const selected = Object.hasOwn(definitions, id) ? id : 'classic';
    if (!loaded.has(selected)) {
      loaded.set(selected, definitions[selected].load().catch(error => { loaded.delete(selected); throw error; }));
    }
    return loaded.get(selected);
  };
}

export const loadDesign = createDesignLoader();
export const loadSelectedDesign = () => loadDesign(getSelectedDesign(getStoredDesignUser()));
